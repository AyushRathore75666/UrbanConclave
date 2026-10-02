import type { Metadata } from "next";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { InnerHero } from "@/components/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.sectors.title, content.meta.siteName), description: content.sectors.intro };
}

export default async function SectorsPage() {
  const content = await getContent(await getLocale());
  return (
    <>
      <InnerHero title={content.sectors.title} lede={content.sectors.intro} />
      <section className="page grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {content.sectors.items.map((sector) => (
          <article key={sector.slug} className="card border-t-4 border-t-saffron-700">
            <h2 className="font-serif text-2xl text-navy-950">{sector.title}</h2>
            <p className="mt-2 text-sm text-mute">{sector.summary}</p>
          </article>
        ))}
      </section>
    </>
  );
}
