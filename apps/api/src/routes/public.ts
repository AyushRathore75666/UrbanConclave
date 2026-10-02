import { randomInt, randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import type { Express, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { prisma } from "../prisma.js";
import { hmac, hashCode, normalizeEmail, normalizeMobile, safeEqualHex, encryptString } from "../crypto.js";
import { requireClientHeader, signOtp } from "../auth.js";
import { readContent, sectorTitle } from "../content.js";
import { ATTENDING_ORG, DISTRICTS, ORG_LABELS, ORG_TYPES, SUPPORT, TIMELINES } from "../constants.js";
import { sendEmail, sendSms } from "../notify.js";
import { assertDocument, scanBuffer } from "../scan.js";
import { contactSchema, newReference, statusSchema, submissionSchema } from "../validate.js";
import { uploadDir } from "../paths.js";

const otpLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, standardHeaders: true, legacyHeaders: false });
const submitLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
const contactLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 8, standardHeaders: true, legacyHeaders: false });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

function one(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

async function verifyCaptcha(id: string, answer: string) {
  if (process.env.RECAPTCHA_SECRET && id === "recaptcha") {
    const body = new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET,
      response: answer,
    });
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", { method: "POST", body });
    const data = (await response.json()) as { success?: boolean };
    if (!data.success) throw new Error("Captcha was not accepted.");
    return;
  }

  const row = await prisma.captchaChallenge.findUnique({ where: { id } });
  const hashed = hmac(answer.trim());
  const valid = Boolean(row && !row.used && row.expiresAt > new Date() && safeEqualHex(row.answerHash, hashed));
  if (row) await prisma.captchaChallenge.update({ where: { id }, data: { used: true } });
  if (!valid) throw new Error("Captcha was not accepted. Please try the new question.");
}

export function registerPublic(app: Express) {
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "mp-conclave-gis" });
  });

  app.get("/api/meta", (_req, res) => {
    res.json({
      districts: DISTRICTS,
      orgTypes: ORG_TYPES.map((value) => ({ value, label: ORG_LABELS[value] })),
      timelines: TIMELINES,
      support: SUPPORT,
      captcha: process.env.RECAPTCHA_SITE_KEY
        ? { mode: "recaptcha", siteKey: process.env.RECAPTCHA_SITE_KEY }
        : { mode: "math" },
    });
  });

  app.get("/api/content/:locale", async (req, res, next) => {
    try {
      const data = await readContent(one(req.params.locale));
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/captcha", async (_req, res, next) => {
    try {
      if (process.env.RECAPTCHA_SITE_KEY) {
        return res.json({ mode: "recaptcha", siteKey: process.env.RECAPTCHA_SITE_KEY });
      }
      const left = randomInt(2, 10);
      const right = randomInt(2, 10);
      const id = randomUUID();
      await prisma.captchaChallenge.create({
        data: {
          id,
          answerHash: hmac(String(left + right)),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });
      res.json({ mode: "math", id, question: `What is ${left} + ${right}?` });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/otp/send", otpLimit, requireClientHeader, async (req, res, next) => {
    try {
      const channel = req.body?.channel === "sms" ? "sms" : req.body?.channel === "email" ? "email" : "";
      if (!channel) return res.status(400).json({ error: "Choose email or mobile." });

      const target = channel === "email" ? normalizeEmail(String(req.body?.target || "")) : normalizeMobile(String(req.body?.target || ""));
      if (!target || (channel === "email" && !target.includes("@"))) {
        return res.status(400).json({ error: channel === "email" ? "Enter a valid official email." : "Enter a valid mobile number." });
      }

      const code = String(randomInt(100000, 1000000));
      const targetHash = hmac(`${channel}:${target}`);
      await prisma.otpCode.deleteMany({ where: { targetHash, channel, verified: false } });
      await prisma.otpCode.create({
        data: {
          channel,
          targetHash,
          codeHash: hashCode(code),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      const message = `Conclave 2.0 code: ${code}. It expires in 10 minutes.`;
      const mode = channel === "email" ? await sendEmail(target, "Your Conclave 2.0 code", message) : await sendSms(target, message);
      const echo = process.env.OTP_DEV_ECHO === "true" && mode === "outbox";
      res.json({ ok: true, devCode: echo ? code : undefined });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/otp/verify", otpLimit, requireClientHeader, async (req, res, next) => {
    try {
      const channel = req.body?.channel === "sms" ? "sms" : "email";
      const target = channel === "email" ? normalizeEmail(String(req.body?.target || "")) : normalizeMobile(String(req.body?.target || ""));
      const code = String(req.body?.code || "").replace(/\D/g, "");
      if (!target || code.length !== 6) return res.status(400).json({ error: "Enter the 6-digit code." });

      const targetHash = hmac(`${channel}:${target}`);
      const row = await prisma.otpCode.findFirst({
        where: { targetHash, channel, verified: false },
        orderBy: { createdAt: "desc" },
      });
      if (!row || row.expiresAt < new Date() || row.attempts >= 5) {
        return res.status(400).json({ error: "That code has expired. Request a new one." });
      }
      if (!safeEqualHex(row.codeHash, hashCode(code))) {
        await prisma.otpCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
        return res.status(400).json({ error: "That code is not correct." });
      }
      await prisma.otpCode.update({ where: { id: row.id }, data: { verified: true } });
      res.json({ ok: true, token: signOtp(channel, targetHash) });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/submissions", submitLimit, requireClientHeader, upload.single("document"), async (req, res, next) => {
    try {
      const raw = typeof req.body?.payload === "string" ? JSON.parse(req.body.payload) : req.body?.payload;
      const parsed = submissionSchema.safeParse(raw);
      if (!parsed.success) {
        return res.status(400).json({ error: "Check the highlighted fields.", fields: flatten(parsed.error.flatten().fieldErrors) });
      }
      const input = parsed.data;
      if (input.companyFax) return res.status(400).json({ error: "The form could not be submitted." });

      const content = await readContent("en");
      const email = normalizeEmail(input.email);
      const mobile = normalizeMobile(input.mobile);
      if (!mobile) return res.status(400).json({ error: "Enter a valid mobile number with country code or a 10-digit Indian number." });

      const emailHash = hmac(`email:${email}`);
      const mobileHash = hmac(`sms:${mobile}`);
      await verifyCaptcha(input.captchaId, input.captchaAnswer);

      const agenda = input.hcmAgenda.trim();
      const description = input.hcmRequested
        ? `HCM meeting requested. Organisation: ${input.hcmOrganization}. Sector: ${input.hcmSector}. Location: ${input.hcmLocation}. Agenda: ${agenda}`
        : "Registered for the Madhya Pradesh Urban Growth Conclave 2.0. No meeting with the Hon'ble Chief Minister was requested.";

      let scanResult: string | null = null;
      let storedName: string | null = null;
      let originalName: string | null = null;
      if (req.file) {
        const ext = assertDocument(req.file.buffer, req.file.originalname);
        scanResult = await scanBuffer(req.file.buffer);
        originalName = path.basename(req.file.originalname).replace(/[^\w.\- ()]/g, "").slice(0, 120);
        storedName = `${randomUUID()}.${ext}`;
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, storedName), req.file.buffer, { mode: 0o600 });
      }

      let reference = newReference();
      let createdId = "";
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const created = await prisma.submission.create({
            data: {
              referenceNumber: reference,
              companyName: input.companyName,
              orgType: ATTENDING_ORG[input.attendingAs],
              country: "India",
              address: `${input.city}, ${input.stateRegion}`,
              city: input.city,
              stateRegion: input.stateRegion,
              pinCode: "NA",
              website: input.website || null,
              contactName: input.contactName,
              designation: input.designation,
              emailCipher: encryptString(email),
              emailHash,
              mobileCipher: encryptString(mobile),
              mobileHash,
              sectors: [input.sector],
              amountValue: input.hcmRequested ? input.hcmAmount! : 0,
              amountUnit: "INR_CRORE",
              timeline: "0-6",
              description: description.slice(0, 1500),
              supportNeeded: [],
              attendingAs: input.attendingAs,
              sessions: input.sessions,
              hcmRequested: input.hcmRequested,
              hcmOrganization: input.hcmRequested ? input.hcmOrganization : null,
              hcmSector: input.hcmRequested ? input.hcmSector : null,
              hcmAmount: input.hcmRequested ? input.hcmAmount : null,
              hcmLocation: input.hcmRequested ? input.hcmLocation : null,
              hcmAgenda: input.hcmRequested ? agenda : null,
              updatesConsent: true,
              documentPath: storedName,
              documentName: originalName,
              scanResult,
              consentAt: new Date(),
            },
          });
          createdId = created.id;
          reference = created.referenceNumber;
          break;
        } catch (error) {
          if (attempt === 2) throw error;
          reference = newReference();
        }
      }

      const sectorName = sectorTitle(content, input.sector);
      const investorText = [
        `Thank you. Your registration for the Madhya Pradesh Urban Growth Conclave 2.0 has been received.`,
        `Reference number: ${reference}`,
        `Organisation: ${input.companyName}`,
        `This submission is not final confirmation. Participation is subject to screening and venue capacity. Selected attendees will be contacted by email about three days before the event.`,
      ].join("\n");

      const teamText = [
        `New Conclave 2.0 registration ${reference}`,
        `Name: ${input.contactName}, ${input.designation}`,
        `Organisation: ${input.companyName}`,
        `Attending as: ${input.attendingAs}`,
        `Sector: ${sectorName}`,
        `City: ${input.city}, ${input.stateRegion}`,
        `Sessions: ${input.sessions.join(", ") || "none"}`,
        `HCM meeting: ${input.hcmRequested ? "requested" : "no"}`,
        input.hcmRequested ? `Proposed investment: ₹${input.hcmAmount} crore at ${input.hcmLocation}` : "",
        `Contact: ${email}, ${mobile}`,
      ].filter(Boolean).join("\n");

      const notifications = {
        email: "pending",
        sms: "pending",
        team: "pending",
      };
      try {
        notifications.email = await sendEmail(email, `Urban Growth Conclave 2.0 registration ${reference}`, investorText);
      } catch {
        notifications.email = "failed";
      }
      try {
        notifications.sms = await sendSms(mobile, `Urban Growth Conclave 2.0: registration received. Reference ${reference}.`);
      } catch {
        notifications.sms = "failed";
      }
      try {
        const inbox = process.env.INVESTMENT_TEAM_EMAIL || "invest-team@mpconclave.example";
        notifications.team = await sendEmail(inbox, `New registration ${reference}`, teamText);
      } catch {
        notifications.team = "failed";
      }

      res.status(201).json({
        referenceNumber: reference,
        id: createdId,
        notifications,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/status", submitLimit, requireClientHeader, async (req, res, next) => {
    try {
      const parsed = statusSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Enter the reference number and the official email." });
      const emailHash = hmac(`email:${normalizeEmail(parsed.data.email)}`);
      const reference = parsed.data.reference.trim().toUpperCase();
      const row = await prisma.submission.findUnique({ where: { referenceNumber: reference } });
      const match = Boolean(row && safeEqualHex(row.emailHash, emailHash));
      if (!row || !match) return res.status(404).json({ error: "No submission matches those details." });
      const content = await readContent("en");
      res.json({
        referenceNumber: row.referenceNumber,
        status: row.status,
        companyName: row.companyName,
        sectors: row.sectors.map((slug) => sectorTitle(content, slug)),
        updatedAt: row.updatedAt,
        createdAt: row.createdAt,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/contact", contactLimit, requireClientHeader, async (req, res, next) => {
    try {
      const parsed = contactSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Check the contact form and try again." });
      if (parsed.data.companyFax) return res.status(400).json({ error: "The message could not be sent." });
      await prisma.contactMessage.create({
        data: {
          name: parsed.data.name,
          email: normalizeEmail(parsed.data.email),
          phone: parsed.data.phone || null,
          message: parsed.data.message,
        },
      });
      const inbox = process.env.INVESTMENT_TEAM_EMAIL || "invest-team@mpconclave.example";
      await sendEmail(
        inbox,
        `Helpdesk message from ${parsed.data.name}`,
        `${parsed.data.message}\n\nFrom: ${parsed.data.name} <${parsed.data.email}> ${parsed.data.phone || ""}`,
      );
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });
}

function flatten(errors: Record<string, string[] | undefined>) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors)) {
    if (value?.[0]) out[key] = value[0];
  }
  return out;
}

export function handleUploadError(error: unknown, _req: Request, res: Response, next: (error: unknown) => void) {
  if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "The file is larger than 10 MB." });
  }
  next(error);
}
