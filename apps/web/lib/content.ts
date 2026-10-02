import en from "../../../content/en.json";
import hi from "../../../content/hi.json";

export type Locale = "en" | "hi";
export type SiteContent = typeof en;

const fallbacks: Record<Locale, SiteContent> = { en, hi };

export async function getLocale(): Promise<Locale> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  return jar.get("locale")?.value === "hi" ? "hi" : "en";
}

export async function getContent(locale: Locale): Promise<SiteContent> {
  try {
    const response = await fetch(`http://127.0.0.1:4000/api/content/${locale}`, { cache: "no-store" });
    if (!response.ok) return fallbacks[locale];
    const data = (await response.json()) as SiteContent;
    if (!data?.microsite || !data.registrationSectors || !data.form?.disclaimer) return fallbacks[locale];
    return data;
  } catch {
    return fallbacks[locale];
  }
}

export function pageTitle(title: string, _siteName?: string) {
  return title;
}
