import type { Metadata } from "next";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { InnerHero, Prose } from "@/components/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.about.title, content.meta.siteName), description: content.about.paragraphs[0] };
}

export default async function AboutPage() {
  const content = await getContent(await getLocale());
  return (
    <>
      <InnerHero title={content.about.title} lede={content.about.paragraphs[0]} />
      <Prose paragraphs={content.about.paragraphs.slice(1)} />
    </>
  );
}
