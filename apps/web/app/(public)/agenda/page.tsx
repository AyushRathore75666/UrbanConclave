import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { InnerHero } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.agenda.title, content.meta.siteName), description: content.agenda.intro };
}

export default async function AgendaPage() {
  const content = await getContent(await getLocale());
  const days = [...new Set(content.agenda.items.map((item) => item.day))];
  return (
    <>
      <InnerHero
        title={content.agenda.title}
        lede={content.agenda.intro}
        image="/scenes/page-road.webp"
        imageAlt="A highway at sunset"
      />
      <section className="relative overflow-hidden py-12">
        <div className="ambient-orb ambient-orb-b" aria-hidden="true" />
        <div className="page relative space-y-10">
          {days.map((day) => (
            <div key={day}>
              <h2 className="font-serif text-2xl text-navy-950">{day}</h2>
              <Reveal stagger>
                <ol className="mt-4 grid gap-3">
                  {content.agenda.items.filter((item) => item.day === day).map((item, index) => (
                    <li key={`${item.time}-${item.title}`} className="pop-in glow-card grid gap-2 rounded-2xl border border-navy-900/10 bg-white px-5 py-4 sm:grid-cols-[6rem_1fr]" style={{ "--i": index } as CSSProperties}>
                      <p className="font-semibold text-saffron-700">{item.time}</p>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-mute">{item.track}</p>
                        <h3 className="text-lg font-semibold text-navy-900">{item.title}</h3>
                        <p className="mt-1 text-sm text-mute">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
