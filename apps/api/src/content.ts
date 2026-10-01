import fs from "fs";
import path from "path";
import { prisma } from "./prisma.js";
import { contentDir } from "./paths.js";

export type ContentDoc = {
  hero?: { title?: string; startISO?: string };
  sectors?: { items?: Array<{ slug: string; title: string }> };
  [key: string]: unknown;
};

export async function readContent(locale: string): Promise<ContentDoc> {
  const safe = locale === "hi" ? "hi" : "en";
  const row = await prisma.contentDocument.findUnique({ where: { locale: safe } });
  if (row && row.data && typeof row.data === "object") return row.data as ContentDoc;
  const file = path.join(contentDir, `${safe}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as ContentDoc;
}

export function sectorSlugSet(content: ContentDoc) {
  const items = content.sectors?.items || [];
  return new Set(items.map((item) => item.slug));
}

export function sectorTitle(content: ContentDoc, slug: string) {
  return content.sectors?.items?.find((item) => item.slug === slug)?.title || slug;
}
