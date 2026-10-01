import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { downloadDir } from "./paths.js";

const FILES: Array<[string, string, string]> = [
  ["brochure.pdf", "Summit brochure", "Placeholder brochure. Replace this file before the site is announced."],
  ["incentive-guide.pdf", "Incentive guide", "Placeholder incentive guide. Replace this file with the approved note."],
  ["policy-documents.pdf", "Policy documents", "Placeholder policy compendium. Replace this file with the approved PDFs."],
];

export async function ensurePlaceholderPdfs() {
  fs.mkdirSync(downloadDir, { recursive: true });
  for (const [name, title, line] of FILES) {
    const dest = path.join(downloadDir, name);
    if (fs.existsSync(dest)) continue;
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    page.drawRectangle({ x: 0, y: 790, width: 595, height: 52, color: rgb(0.043, 0.122, 0.227) });
    page.drawText("MP Conclave GIS", { x: 48, y: 810, size: 14, font: bold, color: rgb(1, 1, 1) });
    page.drawText(title, { x: 48, y: 720, size: 26, font: bold, color: rgb(0.043, 0.122, 0.227) });
    page.drawText(line, { x: 48, y: 680, size: 12, font, color: rgb(0.15, 0.2, 0.28) });
    page.drawText("Global Investors Summit, Madhya Pradesh", {
      x: 48,
      y: 650,
      size: 12,
      font,
      color: rgb(0.6, 0.2, 0.07),
    });
    fs.writeFileSync(dest, await doc.save());
  }
}
