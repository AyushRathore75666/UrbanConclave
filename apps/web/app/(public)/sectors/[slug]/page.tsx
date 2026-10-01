import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent, getLocale } from "@/lib/content";
import { getUi } from "@/lib/ui";
import { InnerHero } from "@/components/page-shell";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent(await getLocale());
  const sector = content.sectors.items.find((item) => item.slug === slug);
  return { title: sector?.title || "Sector", description: sector?.summary };
}

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const content = await getContent(locale);
  const ui = getUi(locale);
  const sector = content.sectors.items.find((item) => item.slug === slug);
  if (!sector) notFound();
  return (
    <>
      <InnerHero kicker={content.sectors.title} title={sector.title} lede={sector.summary} />
      <section className="page max-w-3xl py-12">
        <p className="text-lg leading-relaxed text-mute">{sector.detail}</p>
        <Link href={`/invest?sector=${sector.slug}`} className="btn-accent mt-8">
          {ui.cta}
        </Link>
      </section>
    </>
  );
}
