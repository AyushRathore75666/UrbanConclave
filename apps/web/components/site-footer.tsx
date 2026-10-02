import type { SiteContent } from "@/lib/content";
import type { Ui } from "@/lib/ui";

export function SiteFooter({ ui, content }: { ui: Ui; content: SiteContent }) {
  return (
    <footer className="bg-navy-950 text-white">
      <Helpdesk content={content} ui={ui} />
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
      <div className="page grid gap-4 py-6 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/60">{ui.helpdesk}</p>
          <a className="mt-1 block text-lg font-semibold" href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/60">{ui.phone}</p>
          <a className="mt-1 block text-lg font-semibold" href={`tel:${content.contact.phone.replace(/\s/g, "")}`}>{content.contact.phone}</a>
        </div>
      </div>
    </section>
  );
}
