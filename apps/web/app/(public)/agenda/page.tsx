import type { Metadata } from "next";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { InnerHero } from "@/components/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.agenda.title, content.meta.siteName), description: content.agenda.intro };
}

export default async function AgendaPage() {
  const content = await getContent(await getLocale());
  const days = [...new Set(content.agenda.items.map((item) => item.day))];
  return (
    <>
      <InnerHero title={content.agenda.title} lede={content.agenda.intro} />
      <section className="page space-y-10 py-12">
        {days.map((day) => (
          <div key={day}>
            <h2 className="font-serif text-2xl text-navy-950">{day}</h2>
            <ol className="mt-4 divide-y divide-navy-900/10 rounded-2xl border border-navy-900/10 bg-white">
              {content.agenda.items.filter((item) => item.day === day).map((item) => (
                <li key={`${item.time}-${item.title}`} className="grid gap-2 px-5 py-4 sm:grid-cols-[6rem_1fr]">
                  <p className="font-semibold text-saffron-700">{item.time}</p>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-mute">{item.track}</p>
                    <h3 className="text-lg font-semibold text-navy-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-mute">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>
    </>
  );
}
