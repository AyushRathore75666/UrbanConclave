import type { Metadata } from "next";
import Link from "next/link";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { getUi } from "@/lib/ui";
import { FaqList } from "@/components/faq-list";
import { InnerHero } from "@/components/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.support.title, content.meta.siteName), description: content.support.intro };
}

export default async function SupportPage() {
  const locale = await getLocale();
  const content = await getContent(locale);
  const ui = getUi(locale);
  return (
    <>
      <InnerHero title={content.support.title} lede={content.support.intro} />
      <section className="page py-12">
        <h2 className="h-section">{ui.journeyTitle}</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-4">
          {content.journey.map((step) => (
            <li key={step.step} className="card">
              <p className="font-serif text-3xl text-saffron-700">{step.step}</p>
              <h3 className="mt-2 font-semibold text-navy-900">{step.title}</h3>
              <p className="mt-2 text-sm text-mute">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-mute">{content.support.helpdeskNote}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/invest" className="btn-accent">{ui.cta}</Link>
          <Link href="/status" className="btn-line">{ui.checkStatus}</Link>
        </div>
        <h2 className="mt-12 font-serif text-3xl text-navy-950">FAQ</h2>
        <FaqList items={content.faqs} />
      </section>
    </>
  );
}
