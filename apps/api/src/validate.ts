import { randomInt } from "crypto";
import { z } from "zod";
import { ATTENDING_AS, DISTRICTS, REGISTRATION_SECTORS, SESSIONS } from "./constants.js";

const clean = (value: string) => value.replace(/\0/g, "").replace(/[<>]/g, "").trim();

const text = (min: number, max: number) =>
  z
    .string()
    .transform(clean)
    .pipe(z.string().min(min).max(max));

const optionalText = (max: number) =>
  z.preprocess((value) => (value == null ? "" : value), z.string().transform(clean).pipe(z.string().max(max)));

function wordCount(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export const submissionSchema = z
  .object({
    contactName: text(2, 120),
    designation: text(2, 120),
    companyName: text(2, 200),
    sector: z.enum(REGISTRATION_SECTORS),
    email: z.string().trim().email().max(200).transform((value) => value.toLowerCase()),
    mobile: z.string().trim().min(8).max(20),
    city: text(2, 80),
    stateRegion: text(2, 80),
    website: optionalText(200),
    attendingAs: z.enum(ATTENDING_AS),
    sessions: z.array(z.enum(SESSIONS)).max(8).default([]),
    hcmRequested: z.boolean(),
    hcmOrganization: optionalText(200),
    hcmSector: optionalText(120),
    hcmAmount: z.preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      z.coerce.number().positive().max(1_000_000_000).optional(),
    ),
    hcmLocation: optionalText(160),
    hcmAgenda: optionalText(2000),
    consent: z.literal(true),
    updatesConsent: z.literal(true),
    captchaId: z.string().min(4).max(80),
    captchaAnswer: z.string().trim().min(1).max(2000),
    companyFax: z.string().max(0).optional().or(z.literal("")),
  })
  .superRefine((input, ctx) => {
    if (!input.hcmRequested) return;
    const required: Array<keyof typeof input> = ["hcmOrganization", "hcmSector", "hcmLocation", "hcmAgenda"];
    for (const key of required) {
      if (!String(input[key] || "").trim()) {
        ctx.addIssue({ code: "custom", path: [key], message: "Required" });
      }
    }
    if (input.hcmAmount == null) {
      ctx.addIssue({ code: "custom", path: ["hcmAmount"], message: "Required" });
    }
    if (wordCount(input.hcmAgenda) > 150) {
      ctx.addIssue({ code: "custom", path: ["hcmAgenda"], message: "Maximum 150 words" });
    }
  });

export const contactSchema = z.object({
  name: text(2, 120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: text(10, 2000),
  companyFax: z.string().max(0).optional().or(z.literal("")),
});

export const statusSchema = z.object({
  reference: z.string().trim().min(6).max(40),
  email: z.string().trim().email().max(200),
});

export function newReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let body = "";
  for (let i = 0; i < 8; i += 1) body += alphabet[randomInt(alphabet.length)];
  return `MP-UGC2026-${body}`;
}

export function districtAllowed(value: string | undefined) {
  if (!value) return true;
  return (DISTRICTS as readonly string[]).includes(value);
}
