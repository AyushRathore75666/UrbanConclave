import type { Metadata } from "next";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { InnerHero, Prose } from "@/components/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.privacy.title, content.meta.siteName) };
}

export default async function PrivacyPage() {
  const content = await getContent(await getLocale());
  return (
    <>
      <InnerHero title={content.privacy.title} />
      <Prose paragraphs={content.privacy.paragraphs} />
    </>
  );
}
