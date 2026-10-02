import type { Metadata } from "next";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { ContactForm } from "@/components/contact-form";
import { getUi } from "@/lib/ui";
import { InnerHero } from "@/components/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.contact.title, content.meta.siteName), description: content.contact.intro };
}

export default async function ContactPage() {
  const locale = await getLocale();
  const content = await getContent(locale);
  const ui = getUi(locale);
  return (
    <>
      <InnerHero
        title={content.contact.title}
        lede={content.contact.intro}
        image="/scenes/page-signature.jpg"
        imageAlt="A person writing on a document"
      />
      <section className="relative overflow-hidden py-12">
        <div className="ambient-orb ambient-orb-a" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-b" aria-hidden="true" />
        <div className="page relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <address className="glow-card card not-italic">
          <p className="font-semibold text-navy-900">{content.contact.address}</p>
          <p className="mt-3 text-sm text-mute">{content.contact.hours}</p>
          <p className="mt-4">
            <a className="font-semibold text-navy-900" href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
          </p>
        </address>
        <ContactForm ui={ui} />
        </div>
      </section>
    </>
  );
}
