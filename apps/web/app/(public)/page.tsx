import type { Metadata } from "next";
import { getContent, getLocale } from "@/lib/content";
import { getUi } from "@/lib/ui";
import { HomePage } from "@/components/home-page";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: { absolute: `${content.hero.title} — ${content.hero.subtitle}` }, description: content.meta.description };
}

export default async function Page() {
  const locale = await getLocale();
  const [content, ui] = await Promise.all([getContent(locale), Promise.resolve(getUi(locale))]);
  return <HomePage content={content} ui={ui} />;
}
