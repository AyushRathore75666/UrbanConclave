import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { InnerHero } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.sectors.title, content.meta.siteName), description: content.sectors.intro };
}

export default async function SectorsPage() {
  const content = await getContent(await getLocale());
  return (
    <>
      <InnerHero
        title={content.sectors.title}
        lede={content.sectors.intro}
        image="/scenes/page-build.jpg"
        imageAlt="Crews building an elevated urban corridor"
      />
      <section className="relative overflow-hidden py-12">
        <div className="ambient-orb ambient-orb-a" aria-hidden="true" />
        <Reveal stagger className="page relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.sectors.items.map((sector, index) => (
            <article key={sector.slug} className="pop-in glow-card card card-lift border-t-4 border-t-saffron-700" style={{ "--i": index } as CSSProperties}>
              <h2 className="font-serif text-2xl text-navy-950">{sector.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-mute">{sector.summary}</p>
            </article>
          ))}
        </Reveal>
      </section>
    </>
  );
}
