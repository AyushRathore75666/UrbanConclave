import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { InnerHero } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.about.title, content.meta.siteName), description: content.about.paragraphs[0] };
}

export default async function AboutPage() {
  const content = await getContent(await getLocale());
  return (
    <>
      <InnerHero
        title={content.about.title}
        lede={content.about.paragraphs[0]}
        image="/scenes/page-meeting.webp"
        imageAlt="People gathered around a meeting table"
      />
      <section className="relative overflow-hidden">
        <div className="ambient-orb ambient-orb-a" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-b" aria-hidden="true" />
        <Reveal stagger className="page relative grid gap-4 py-12">
          {content.about.paragraphs.slice(1).map((paragraph, index) => (
            <p key={paragraph.slice(0, 48)} className="pop-in glow-card rounded-2xl bg-white px-5 py-4 text-lg leading-relaxed text-mute" style={{ "--i": index } as CSSProperties}>
              {paragraph}
            </p>
          ))}
        </Reveal>
      </section>
    </>
  );
}
