import Image from "next/image";
import Link from "next/link";
import type { SiteContent } from "@/lib/content";
import type { Ui } from "@/lib/ui";
import { Icon } from "./icons";
import { JsonLd } from "@/components/page-shell";
import { Reveal } from "./reveal";
import { LeadershipRotator } from "./leadership-rotator";

export function HomePage({ content, ui }: { content: SiteContent; ui: Ui }) {
  const site = content.microsite;

  return (
    <>
      <JsonLd content={content} />
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="logo-glow absolute -left-24 top-10 h-80 w-80 rounded-full bg-saffron-500/20 blur-3xl" />
          <div className="logo-glow absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
        </div>
        <div className="page relative grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="rise">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F6D3B8]">{content.hero.kicker}</p>
            <p className="mt-3 text-sm text-white/70">{content.hero.organiser}</p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[0.95] sm:text-6xl">{content.hero.title}</h1>
            <p className="mt-4 text-2xl text-white/90">{content.hero.subtitle}</p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#F6D3B8]">
              {content.hero.dates}
              <span className="mx-2 text-white/40">|</span>
              {content.hero.venue}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80">{site.heroIntro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/invest" className="btn-accent">{ui.investNow}</Link>
              <Link href="/agenda" className="btn-ghost">{ui.viewAgenda}</Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[380px]">
            <div className="logo-glow absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(224,112,32,0.45),transparent_68%)]" aria-hidden="true" />
            <div className="logo-ring absolute inset-[4%] rounded-full border border-dashed border-[#F6D3B8]/50" aria-hidden="true" />
            <Image
              src="/brand/gis-mark-clear.png"
              alt="Madhya Pradesh Urban Growth Conclave 2.0 emblem"
              width={512}
              height={512}
              priority
              className="hero-mark absolute inset-0 z-10 h-full w-full object-contain"
            />
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <Image
                src="/brand/mp-icon.png"
                alt="Madhya Pradesh"
                width={595}
                height={419}
                className="hero-mark hero-mark-alt h-auto w-[72%] max-w-none object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-navy-900/10 bg-white">
        <div className="page grid gap-4 py-5 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-saffron-700">{site.hostKicker}</p>
            <p className="mt-1 text-base font-normal leading-snug text-navy-950">{site.hostCity}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-saffron-700">{ui.dates}</p>
            <p className="mt-1 text-base font-normal leading-snug text-navy-950">{content.hero.dates}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-saffron-700">{ui.venue}</p>
            <p className="mt-1 text-base font-normal leading-snug text-navy-950">{content.hero.venue}</p>
          </div>
        </div>
      </section>

      <LeadershipRotator people={content.leadership.people} />

      <section className="page py-14" id="about">
        <Reveal>
          <p className="kicker">{site.departmentKicker}</p>
          <h2 className="mt-2 h-section">{site.departmentTitle}</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-mute">{site.departmentBody}</p>
          <h2 className="mt-12 h-section">{content.about.title}</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-mute">{content.about.paragraphs[1]}</p>
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-navy-900">{site.highlightsTitle}</h3>
            <ul className="mt-4 flex flex-wrap gap-3">
              {site.highlights.map((item) => (
                <li key={item} className="rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm text-navy-900">{item}</li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-navy-900">{site.audienceTitle}</h3>
            <ul className="mt-4 flex flex-wrap gap-3">
              {site.audience.map((item) => (
                <li key={item} className="rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm font-medium text-navy-900">{item}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="bg-white py-14" id="agenda">
        <div className="page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="h-section">{content.agenda.title}</h2>
            <Link href="/agenda" className="text-sm font-semibold text-saffron-700">{ui.viewAgenda}</Link>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-mute">{content.agenda.intro}</p>
          <ol className="mt-8 grid gap-4 lg:grid-cols-2">
            {content.agenda.items.map((item) => (
              <li key={`${item.time}-${item.title}`} className="card card-lift">
                <p className="text-sm font-semibold text-saffron-700">{item.time}</p>
                <h3 className="mt-1 text-lg font-semibold text-navy-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page py-14" id="panels">
        <p className="kicker">Sessions</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-section">{content.sectors.title}</h2>
          <Link href="/sectors" className="text-sm font-semibold text-saffron-700">{ui.readMore}</Link>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-mute">{content.sectors.intro}</p>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {content.sectors.items.map((panel) => (
            <article key={panel.slug} className="card card-lift border-t-4 border-t-saffron-700">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-saffron-700">{panel.code}</p>
              <h3 className="mt-2 text-lg font-semibold text-navy-900">{panel.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{panel.summary}</p>
              <p className="mt-3 text-sm text-navy-900">{panel.detail}</p>
              <Link href={`/invest?session=${panel.slug}`} className="mt-4 inline-block text-sm font-semibold text-saffron-700">
                {ui.showInterest}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="page py-14">
        <h2 className="h-section">{content.whyInvest.title}</h2>
        <p className="mt-3 max-w-3xl text-mute">{content.whyInvest.intro}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {content.whyInvest.items.map((item) => (
            <article key={item.title} className="card card-lift">
              <Icon name={item.icon} />
              <h3 className="mt-3 text-lg font-semibold text-navy-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{item.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
