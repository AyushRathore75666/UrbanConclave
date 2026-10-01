import Link from "next/link";
import type { SiteContent } from "@/lib/content";
import type { Ui } from "@/lib/ui";

export function SiteFooter({ ui, content }: { ui: Ui; content: SiteContent }) {
  return (
    <footer className="bg-navy-950 text-white">
      <Helpdesk content={content} ui={ui} />
      <div className="page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-xl">{content.hero.title}</p>
          <p className="mt-2 text-sm text-white/75">
            {content.hero.subtitle}
            <br />
            {content.hero.dates}
            <br />
            {content.hero.venue}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">{ui.footer.summit}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about">{ui.nav.about}</Link></li>
            <li><Link href="/why-invest">{ui.nav.why}</Link></li>
            <li><Link href="/sectors">{ui.nav.sectors}</Link></li>
            <li><Link href="/agenda">{ui.nav.agenda}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">{ui.footer.help}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/invest">{ui.cta}</Link></li>
            <li><Link href="/support">{ui.nav.support}</Link></li>
            <li><Link href="/status">{ui.checkStatus}</Link></li>
            <li><Link href="/downloads">{ui.nav.downloads}</Link></li>
            <li><Link href="/contact">{ui.nav.contact}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">{ui.footer.legal}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/privacy">{ui.footer.privacy}</Link></li>
            <li><Link href="/terms">{ui.footer.terms}</Link></li>
          </ul>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">{ui.footer.government}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {content.governmentLinks.map((link) => (
              <li key={link.url}>
                <a href={link.url} rel="noreferrer">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="page flex flex-col gap-3 py-5 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>{ui.footer.rights}</p>
          <ul className="flex flex-wrap gap-4">
            {content.contact.socials.map((social) => (
              <li key={social.label}>
                {social.url ? (
                  <a href={social.url} rel="noreferrer">{social.label}</a>
                ) : (
                  <span>
                    {social.label}
                    <span className="sr-only"> — {ui.footer.socialPending}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Helpdesk({ content, ui }: { content: SiteContent; ui: Ui }) {
  return (
    <section className="border-b border-white/10 bg-navy-900">
      <div className="page grid gap-4 py-6 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/60">{ui.helpdesk}</p>
          <a className="mt-1 block text-lg font-semibold" href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/60">{ui.phone}</p>
          <a className="mt-1 block text-lg font-semibold" href={`tel:${content.contact.phone.replace(/\s/g, "")}`}>{content.contact.phone}</a>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/60">{ui.whatsapp}</p>
          {content.contact.whatsappUrl ? (
            <a className="mt-1 block text-lg font-semibold" href={content.contact.whatsappUrl}>{content.contact.whatsapp}</a>
          ) : (
            <p className="mt-1 text-lg font-semibold">{content.contact.whatsapp}</p>
          )}
        </div>
      </div>
    </section>
  );
}
