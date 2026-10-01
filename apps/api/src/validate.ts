import { randomInt } from "crypto";
import { z } from "zod";
import { AMOUNT_UNITS, DISTRICTS, ORG_TYPES, SUPPORT, TIMELINES } from "./constants.js";

const clean = (value: string) => value.replace(/\0/g, "").replace(/[<>]/g, "").trim();

const text = (min: number, max: number) =>
  z
    .string()
    .transform(clean)
    .pipe(z.string().min(min).max(max));

const optionalText = (max: number) =>
  z.preprocess((value) => (value == null ? "" : value), z.string().transform(clean).pipe(z.string().max(max)));

const optionalPositive = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.coerce.number().positive().max(1_000_000).optional(),
);

const optionalCount = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.coerce.number().int().nonnegative().max(10_000_000).optional(),
);

export const submissionSchema = z.object({
  companyName: text(2, 200),
  orgType: z.enum(ORG_TYPES),
  country: text(2, 80),
  address: text(3, 300),
  city: text(2, 80),
  stateRegion: text(2, 80),
  pinCode: text(3, 12),
  website: optionalText(200),
  registrationNumber: optionalText(60),
  contactName: text(2, 120),
  designation: text(2, 120),
  email: z.string().trim().email().max(200).transform((value) => value.toLowerCase()),
  mobile: z.string().trim().min(8).max(20),
  sectors: z.array(z.string().trim().min(2).max(40)).min(1).max(9),
  amountValue: z.coerce.number().positive().max(1_000_000_000),
  amountUnit: z.enum(AMOUNT_UNITS),
  district: optionalText(80),
  landAcres: optionalPositive,
  expectedEmployment: optionalCount,
  timeline: z.enum(TIMELINES),
  description: text(20, 1500),
  supportNeeded: z.array(z.enum(SUPPORT)).max(5).default([]),
  emailOtpToken: z.string().min(20),
  mobileOtpToken: z.string().min(20),
  captchaId: z.string().min(4).max(80),
  captchaAnswer: z.string().trim().min(1).max(2000),
  consent: z.literal(true),
  companyFax: z.string().max(0).optional().or(z.literal("")),
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
  return `MPGIS-${new Date().getFullYear()}-${body}`;
}

export function districtAllowed(value: string | undefined) {
  if (!value) return true;
  return (DISTRICTS as readonly string[]).includes(value);
}
