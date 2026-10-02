import fs from "fs/promises";
import path from "path";
import type { Express, Response } from "express";
import rateLimit from "express-rate-limit";
import type { Prisma, Role, Submission, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, requireRole } from "../auth.js";
import { audit, canEditContent, canEditLeads, canExport, canSeePii } from "../audit.js";
import { decryptString, maskEmail, maskMobile } from "../crypto.js";
import { readContent, sectorTitle } from "../content.js";
import { LEAD_STATUSES, ROLES } from "../constants.js";
import { uploadDir } from "../paths.js";

const leadRoles: Role[] = ["SUPER_ADMIN", "INVESTMENT_TEAM", "VIEWER"];

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
});

function one(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function actor(res: Response) {
  return res.locals.actor as User;
}

function present(row: Submission & { assignedTo?: { id: string; name: string; email: string } | null }, role: Role) {
  const email = decryptString(row.emailCipher);
  const mobile = decryptString(row.mobileCipher);
  const open = canSeePii(role);
  return {
    id: row.id,
    referenceNumber: row.referenceNumber,
    status: row.status,
    isSample: row.isSample,
    companyName: row.companyName,
    orgType: row.orgType,
    country: row.country,
    address: open ? row.address : undefined,
    city: row.city,
    stateRegion: row.stateRegion,
    pinCode: open ? row.pinCode : undefined,
    website: row.website,
    registrationNumber: open ? row.registrationNumber : undefined,
    contactName: row.contactName,
    designation: row.designation,
    email: open ? email : maskEmail(email),
    mobile: open ? mobile : maskMobile(mobile),
    sectors: row.sectors,
    amountValue: Number(row.amountValue),
    amountUnit: row.amountUnit,
    district: row.district,
    landAcres: row.landAcres == null ? null : Number(row.landAcres),
    expectedEmployment: row.expectedEmployment,
    timeline: row.timeline,
    description: row.description,
    supportNeeded: row.supportNeeded,
    attendingAs: row.attendingAs,
    sessions: row.sessions,
    hcmRequested: row.hcmRequested,
    hcmOrganization: row.hcmOrganization,
    hcmSector: row.hcmSector,
    hcmAmount: row.hcmAmount == null ? null : Number(row.hcmAmount),
    hcmLocation: row.hcmLocation,
    hcmAgenda: row.hcmAgenda,
    updatesConsent: row.updatesConsent,
    documentName: row.documentName,
    hasDocument: Boolean(row.documentPath),
    scanResult: row.scanResult,
    consentAt: row.consentAt,
    assignedTo: row.assignedTo ? { id: row.assignedTo.id, name: row.assignedTo.name } : null,
    cmVisitFixed: row.cmVisitFixed,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function filters(query: Record<string, unknown>): Prisma.SubmissionWhereInput {
  const where: Prisma.SubmissionWhereInput = {};
  const status = String(query.status || "");
  if ((LEAD_STATUSES as readonly string[]).includes(status)) where.status = status as (typeof LEAD_STATUSES)[number];
  const sector = String(query.sector || "");
  if (sector) where.sectors = { has: sector };
  const district = String(query.district || "");
  if (district) where.district = district;
  const unit = String(query.amountUnit || "");
  if (unit === "INR_CRORE" || unit === "USD_MILLION") where.amountUnit = unit;
  const q = String(query.q || "").trim();
  if (q) {
    where.OR = [
      { companyName: { contains: q, mode: "insensitive" } },
      { referenceNumber: { contains: q, mode: "insensitive" } },
      { country: { contains: q, mode: "insensitive" } },
      { contactName: { contains: q, mode: "insensitive" } },
    ];
  }
  const min = Number(query.minAmount);
  const max = Number(query.maxAmount);
  if (Number.isFinite(min) && query.minAmount) where.amountValue = { ...(where.amountValue as object), gte: min };
  if (Number.isFinite(max) && query.maxAmount) where.amountValue = { ...(where.amountValue as object), lte: max };
  const visit = String(query.cmVisit || "");
  if (visit === "on") where.cmVisitFixed = true;
  if (visit === "off") where.cmVisitFixed = false;
  const from = String(query.from || "");
  const to = String(query.to || "");
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }
  return where;
}

export function registerAdmin(app: Express) {
  app.post("/api/admin/login", loginLimit, async (req, res, next) => {
    try {
      const email = String(req.body?.email || "").trim().toLowerCase();
      const password = String(req.body?.password || "");
      const user = await prisma.user.findUnique({ where: { email } });
      const match = user ? await bcrypt.compare(password, user.passwordHash) : false;
      if (!user || !user.active || !match) {
        await audit({ action: "login_failed", entity: "user", metadata: { email }, ip: req.ip });
        return res.status(401).json({ error: "Invalid email or password." });
      }
      const { signAdmin } = await import("../auth.js");
      await audit({ actorId: user.id, action: "login", entity: "user", entityId: user.id, ip: req.ip });
      res.json({
        token: signAdmin(user),
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/me", requireAuth, (req, res) => {
    const user = actor(res);
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  });

  app.get("/api/admin/dashboard", requireAuth, requireRole(...leadRoles, "CONTENT_EDITOR"), async (req, res, next) => {
    try {
      const rows = await prisma.submission.findMany({
        select: { sectors: true, amountValue: true, amountUnit: true, country: true, status: true, createdAt: true },
      });
      const content = await readContent("en");
      const sectorMap = new Map<string, number>();
      const countryMap = new Map<string, number>();
      const statusMap = new Map<string, number>();
      let inr = 0;
      let usd = 0;
      for (const row of rows) {
        statusMap.set(row.status, (statusMap.get(row.status) || 0) + 1);
        countryMap.set(row.country, (countryMap.get(row.country) || 0) + 1);
        if (row.amountUnit === "INR_CRORE") inr += Number(row.amountValue);
        if (row.amountUnit === "USD_MILLION") usd += Number(row.amountValue);
        for (const slug of row.sectors) {
          const label = sectorTitle(content, slug);
          sectorMap.set(label, (sectorMap.get(label) || 0) + 1);
        }
      }
      const messages = canEditLeads(actor(res).role)
        ? await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 })
        : [];
      res.json({
        total: rows.length,
        investment: { inrCrore: round(inr), usdMillion: round(usd) },
        bySector: [...sectorMap.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
        byCountry: [...countryMap.entries()].map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count),
        byStatus: [...statusMap.entries()].map(([status, count]) => ({ status, count })),
        messages,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/submissions/export", requireAuth, async (req, res, next) => {
    try {
      if (!canExport(actor(res).role)) return res.status(403).json({ error: "You do not have access to export." });
      const where = filters(req.query as Record<string, unknown>);
      const rows = await prisma.submission.findMany({
        where,
        include: { assignedTo: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 5000,
      });
      const content = await readContent("en");
      const records = rows.map((row) => {
        const view = present(row, actor(res).role);
        return {
          Reference: view.referenceNumber,
          Status: view.status,
          Company: view.companyName,
          Organisation: view.orgType,
          Country: view.country,
          City: view.city,
          Contact: view.contactName,
          Designation: view.designation,
          Email: view.email,
          Mobile: view.mobile,
          Sectors: view.sectors.map((slug) => sectorTitle(content, slug)).join("; "),
          Amount: view.amountValue,
          Unit: view.amountUnit,
          District: view.district || "",
          "Land (acres)": view.landAcres ?? "",
          Employment: view.expectedEmployment ?? "",
          Timeline: view.timeline,
          Description: view.description,
          Support: view.supportNeeded.join("; "),
          "Attending as": view.attendingAs,
          Sessions: view.sessions.join("; "),
          "HCM requested": view.hcmRequested ? "yes" : "no",
          "HCM organisation": view.hcmOrganization || "",
          "HCM sector": view.hcmSector || "",
          "HCM amount (₹ crore)": view.hcmAmount ?? "",
          "HCM location": view.hcmLocation || "",
          "HCM agenda": view.hcmAgenda || "",
          Officer: view.assignedTo?.name || "",
          "Visit with CM": view.cmVisitFixed ? "On" : "Off",
          Sample: view.isSample ? "yes" : "no",
          Received: view.createdAt.toISOString(),
        };
      });

      await audit({
        actorId: actor(res).id,
        action: "export",
        entity: "submission",
        metadata: { count: records.length, format: String(req.query.format || "xlsx") },
        ip: req.ip,
      });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Interests");
      const columns = Object.keys(records[0] || { Reference: "" });
      sheet.columns = columns.map((key) => ({ header: key, key, width: 22 }));
      for (const record of records) sheet.addRow(record);

      if (req.query.format === "csv") {
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=investment-interests.csv");
        const csv = await workbook.csv.writeBuffer();
        return res.send(Buffer.from(csv));
      }

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=investment-interests.xlsx");
      const xlsx = await workbook.xlsx.writeBuffer();
      res.send(Buffer.from(xlsx));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/submissions", requireAuth, requireRole(...leadRoles), async (req, res, next) => {
    try {
      const where = filters(req.query as Record<string, unknown>);
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = 20;
      const [total, rows] = await Promise.all([
        prisma.submission.count({ where }),
        prisma.submission.findMany({
          where,
          include: { assignedTo: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      res.json({
        total,
        page,
        pageSize,
        items: rows.map((row) => present(row, actor(res).role)),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/submissions/:id", requireAuth, requireRole(...leadRoles), async (req, res, next) => {
    try {
      const row = await prisma.submission.findUnique({
        where: { id: one(req.params.id) },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          notes: { include: { author: { select: { name: true, role: true } } }, orderBy: { createdAt: "asc" } },
        },
      });
      if (!row) return res.status(404).json({ error: "Submission not found." });
      res.json({
        ...present(row, actor(res).role),
        notes: row.notes.map((note) => ({
          id: note.id,
          body: note.body,
          createdAt: note.createdAt,
          author: note.author.name,
          role: note.author.role,
        })),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/submissions/:id/document", requireAuth, requireRole("SUPER_ADMIN", "INVESTMENT_TEAM"), async (req, res, next) => {
    try {
      const row = await prisma.submission.findUnique({ where: { id: one(req.params.id) } });
      if (!row?.documentPath) return res.status(404).json({ error: "No document was attached." });
      const full = path.resolve(uploadDir, path.basename(row.documentPath));
      if (!full.startsWith(path.resolve(uploadDir))) return res.status(400).json({ error: "Invalid file." });
      res.download(full, row.documentName || path.basename(full));
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/submissions/:id", requireAuth, requireRole("SUPER_ADMIN", "INVESTMENT_TEAM"), async (req, res, next) => {
    try {
      const schema = z.object({
        status: z.enum(LEAD_STATUSES).optional(),
        assignedToId: z.string().nullable().optional(),
        cmVisitFixed: z.boolean().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "The update was not valid." });
      const existing = await prisma.submission.findUnique({ where: { id: one(req.params.id) } });
      if (!existing) return res.status(404).json({ error: "Submission not found." });

      if (parsed.data.assignedToId) {
        const officer = await prisma.user.findUnique({ where: { id: parsed.data.assignedToId } });
        if (!officer || !officer.active || (officer.role !== "INVESTMENT_TEAM" && officer.role !== "SUPER_ADMIN")) {
          return res.status(400).json({ error: "Choose an active investment officer." });
        }
      }

      const updated = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          status: parsed.data.status,
          assignedToId: parsed.data.assignedToId === undefined ? undefined : parsed.data.assignedToId,
          cmVisitFixed: parsed.data.cmVisitFixed,
        },
        include: { assignedTo: { select: { id: true, name: true, email: true } } },
      });
      await audit({
        actorId: actor(res).id,
        action: "lead_updated",
        entity: "submission",
        entityId: updated.id,
        metadata: {
          from: existing.status,
          to: updated.status,
          assignedToId: updated.assignedToId,
          cmVisitFixed: updated.cmVisitFixed,
        },
        ip: req.ip,
      });
      res.json(present(updated, actor(res).role));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/submissions/:id/notes", requireAuth, requireRole("SUPER_ADMIN", "INVESTMENT_TEAM"), async (req, res, next) => {
    try {
      const body = String(req.body?.body || "").replace(/[<>]/g, "").trim();
      if (body.length < 2 || body.length > 2000) return res.status(400).json({ error: "Write a note between 2 and 2000 characters." });
      const existing = await prisma.submission.findUnique({ where: { id: one(req.params.id) } });
      if (!existing) return res.status(404).json({ error: "Submission not found." });
      const note = await prisma.note.create({
        data: { submissionId: existing.id, authorId: actor(res).id, body },
        include: { author: { select: { name: true, role: true } } },
      });
      await audit({ actorId: actor(res).id, action: "note_added", entity: "submission", entityId: existing.id, ip: req.ip });
      res.status(201).json({ id: note.id, body: note.body, createdAt: note.createdAt, author: note.author.name, role: note.author.role });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/officers", requireAuth, requireRole("SUPER_ADMIN", "INVESTMENT_TEAM"), async (_req, res, next) => {
    try {
      const users = await prisma.user.findMany({
        where: { active: true, role: { in: ["SUPER_ADMIN", "INVESTMENT_TEAM"] } },
        select: { id: true, name: true, role: true },
        orderBy: { name: "asc" },
      });
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/content/:locale", requireAuth, requireRole("SUPER_ADMIN", "CONTENT_EDITOR", "VIEWER"), async (req, res, next) => {
    try {
      const locale = one(req.params.locale) === "hi" ? "hi" : "en";
      const row = await prisma.contentDocument.findUnique({ where: { locale } });
      res.json({ locale, updatedAt: row?.updatedAt || null, data: await readContent(locale) });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/content/:locale", requireAuth, async (req, res, next) => {
    try {
      if (!canEditContent(actor(res).role)) return res.status(403).json({ error: "You do not have access to edit content." });
      const locale = one(req.params.locale) === "hi" ? "hi" : "en";
      const data = req.body?.data;
      if (!data || typeof data !== "object" || !data.hero?.title) {
        return res.status(400).json({ error: "Content must include a hero title." });
      }
      const saved = await prisma.contentDocument.upsert({
        where: { locale },
        create: { locale, data, updatedBy: actor(res).id },
        update: { data, updatedBy: actor(res).id },
      });
      await audit({ actorId: actor(res).id, action: "content_updated", entity: "content", entityId: locale, ip: req.ip });
      res.json({ locale, updatedAt: saved.updatedAt });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/audit", requireAuth, requireRole("SUPER_ADMIN", "VIEWER"), async (req, res, next) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const [total, items] = await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.findMany({
          include: { actor: { select: { name: true, email: true, role: true } } },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * 40,
          take: 40,
        }),
      ]);
      res.json({ total, page, items });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/users", requireAuth, requireRole("SUPER_ADMIN"), async (_req, res, next) => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      });
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/users", requireAuth, requireRole("SUPER_ADMIN"), async (req, res, next) => {
    try {
      const schema = z.object({
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().email(),
        password: z.string().min(10).max(100),
        role: z.enum(ROLES),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Name, email, role, and a password of at least 10 characters are required." });
      const passwordHash = await bcrypt.hash(parsed.data.password, 12);
      const user = await prisma.user.create({
        data: {
          name: parsed.data.name.replace(/[<>]/g, ""),
          email: parsed.data.email.toLowerCase(),
          passwordHash,
          role: parsed.data.role,
        },
        select: { id: true, name: true, email: true, role: true, active: true },
      });
      await audit({ actorId: actor(res).id, action: "user_created", entity: "user", entityId: user.id, metadata: { role: user.role }, ip: req.ip });
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/samples", requireAuth, requireRole("SUPER_ADMIN"), async (req, res, next) => {
    try {
      const result = await prisma.submission.deleteMany({ where: { isSample: true } });
      await audit({ actorId: actor(res).id, action: "samples_deleted", entity: "submission", metadata: { count: result.count }, ip: req.ip });
      res.json({ deleted: result.count });
    } catch (error) {
      next(error);
    }
  });
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
