import type { Metadata } from "next";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { Icon } from "@/components/icons";
import { InnerHero } from "@/components/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.whyInvest.title, content.meta.siteName), description: content.whyInvest.intro };
}

export default async function WhyPage() {
  const content = await getContent(await getLocale());
  return (
    <>
      <InnerHero title={content.whyInvest.title} lede={content.whyInvest.intro} />
      <section className="page grid gap-4 py-12 md:grid-cols-2">
        {content.whyInvest.items.map((item) => (
          <article key={item.title} className="card">
            <Icon name={item.icon} />
            <h2 className="mt-3 font-serif text-2xl text-navy-950">{item.title}</h2>
            <p className="mt-3 text-mute">{item.summary}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink">{item.detail}</p>
          </article>
        ))}
      </section>
    </>
  );
}
