import fs from "fs/promises";
import nodemailer from "nodemailer";
import { outboxPath } from "./paths.js";

async function record(entry: unknown) {
  await fs.mkdir(pathDir(outboxPath), { recursive: true });
  await fs.appendFile(outboxPath, `${JSON.stringify(entry)}\n`, "utf8");
}

function pathDir(file: string) {
  const index = file.lastIndexOf("/");
  return index === -1 ? "." : file.slice(0, index);
}

export async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.SMTP_HOST) {
    await record({ at: new Date().toISOString(), channel: "email", to, subject, text });
    return "outbox" as const;
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
  return "smtp" as const;
}

export async function sendSms(to: string, message: string) {
  if (!process.env.SMS_API_URL) {
    await record({ at: new Date().toISOString(), channel: "sms", to, message });
    return "outbox" as const;
  }

  const response = await fetch(process.env.SMS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SMS_API_KEY || ""}`,
    },
    body: JSON.stringify({ to, message }),
  });

  if (!response.ok) {
    throw new Error(`SMS gateway returned ${response.status}`);
  }
  return "sms" as const;
}
