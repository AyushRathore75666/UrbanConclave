import type { Metadata } from "next";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { InnerHero, Prose } from "@/components/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.terms.title, content.meta.siteName) };
}

export default async function TermsPage() {
  const content = await getContent(await getLocale());
  return (
    <>
      <InnerHero title={content.terms.title} />
      <Prose paragraphs={content.terms.paragraphs} />
    </>
  );
}
