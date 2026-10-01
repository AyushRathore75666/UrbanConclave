import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma.js";
import { contentDir } from "./paths.js";
import { encryptString, hmac } from "./crypto.js";
import { ensurePlaceholderPdfs } from "./pdfs.js";

const ACCOUNTS = [
  ["super@mpconclave.local", "Super Admin", "SUPER_ADMIN"],
  ["editor@mpconclave.local", "Content Editor", "CONTENT_EDITOR"],
  ["invest@mpconclave.local", "Investment Officer", "INVESTMENT_TEAM"],
  ["viewer@mpconclave.local", "Read-only Viewer", "VIEWER"],
] as const;

export async function seed() {
  await ensurePlaceholderPdfs();

  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "", 12);
  for (const [email, name, role] of ACCOUNTS) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({ data: { email, name, role, passwordHash } });
    }
  }

  for (const locale of ["en", "hi"] as const) {
    const existing = await prisma.contentDocument.findUnique({ where: { locale } });
    if (existing) continue;
    const data = JSON.parse(fs.readFileSync(path.join(contentDir, `${locale}.json`), "utf8"));
    await prisma.contentDocument.create({ data: { locale, data } });
  }

  if (process.env.SEED_SAMPLE_DATA === "false") return;
  const existingLeads = await prisma.submission.count();
  if (existingLeads > 0) return;

  const officer = await prisma.user.findUnique({ where: { email: "invest@mpconclave.local" } });
  const samples = [
    ["Sample Company Alpha", "India", "Indore", ["industry", "logistics"], 250, "INR_CRORE", "0-6"],
    ["Sample Company Beta", "Japan", "Indore", ["it-electronics"], 40, "USD_MILLION", "6-12"],
    ["Sample Company Gamma", "Germany", "Bhopal", ["renewable-energy"], 180, "INR_CRORE", "12-24"],
    ["Sample Company Delta", "United States", "Indore", ["pharma"], 25, "USD_MILLION", "6-12"],
    ["Sample Company Epsilon", "India", "Jabalpur", ["agriculture-food"], 90, "INR_CRORE", "0-6"],
    ["Sample Company Zeta", "United Arab Emirates", "Bhopal", ["tourism"], 60, "USD_MILLION", "24+"],
    ["Sample Company Eta", "India", "Gwalior", ["textiles"], 45, "INR_CRORE", "12-24"],
    ["Sample Company Theta", "Singapore", "Singrauli", ["mining", "industry"], 15, "USD_MILLION", "24+"],
  ] as const;

  for (const [companyName, country, district, sectors, amount, unit, timeline] of samples) {
    const email = `${companyName.split(" ").pop()!.toLowerCase()}@sample.example`;
    const mobile = "+919800000000";
    const safeDistrict = district;
    await prisma.submission.create({
      data: {
        referenceNumber: `MPGIS-SAMPLE-${companyName.split(" ").pop()!.toUpperCase()}`,
        isSample: true,
        status: companyName.endsWith("Alpha") ? "UNDER_REVIEW" : companyName.endsWith("Beta") ? "CONTACTED" : "RECEIVED",
        companyName,
        orgType: country === "India" ? "PRIVATE" : "FOREIGN",
        country,
        address: "Sample address, not a real office",
        city: "Sample city",
        stateRegion: "Sample state",
        pinCode: "000000",
        contactName: "Sample Contact",
        designation: "Director",
        emailCipher: encryptString(email),
        emailHash: hmac(`email:${email}`),
        mobileCipher: encryptString(mobile),
        mobileHash: hmac(`sms:${mobile}`),
        sectors: [...sectors],
        amountValue: amount,
        amountUnit: unit,
        district: safeDistrict,
        timeline,
        description: "Sample project description for the dashboard. This is not a real proposal.",
        supportNeeded: ["land", "approvals"],
        consentAt: new Date(),
        assignedToId: companyName.endsWith("Alpha") ? officer?.id : null,
      },
    });
  }

  console.log("Seeded admin accounts and sample interests.");
}
