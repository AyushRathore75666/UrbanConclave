import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SiteContent } from "@/lib/content";
import type { Ui } from "@/lib/ui";
import { Icon } from "./icons";
import { JsonLd } from "@/components/page-shell";
import { Reveal } from "./reveal";
import { LeadershipRotator } from "./leadership-rotator";
import { PhotoCrossfade } from "./photo-crossfade";

export function HomePage({ content, ui }: { content: SiteContent; ui: Ui }) {
  const site = content.microsite;

  return (
    <>
      <JsonLd content={content} />
      <section className="hero-banner relative isolate overflow-hidden bg-navy-950 text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="hero-aurora" />
          <div className="hero-grid" />
          <img src="/brand/mp-icon.png" alt="" className="hero-city" />
          <div className="hero-sheen" />
          <svg className="hero-skyline" viewBox="0 0 1440 220" preserveAspectRatio="none">
            <path className="hero-ground" d="M0 170h1440v50H0z" />
            <g className="hero-buildings">
              <rect x="40" y="90" width="46" height="80" />
              <rect x="96" y="60" width="34" height="110" />
              <rect x="140" y="108" width="70" height="62" />
              <rect x="230" y="48" width="28" height="122" />
              <rect x="266" y="78" width="52" height="92" />
              <rect x="330" y="36" width="22" height="134" />
              <rect x="360" y="96" width="80" height="74" />
              <rect x="460" y="54" width="40" height="116" />
              <rect x="510" y="84" width="64" height="86" />
              <rect x="600" y="40" width="26" height="130" />
              <rect x="636" y="70" width="48" height="100" />
              <rect x="700" y="100" width="90" height="70" />
              <rect x="810" y="52" width="36" height="118" />
              <rect x="856" y="78" width="58" height="92" />
              <rect x="930" y="34" width="24" height="136" />
              <rect x="964" y="88" width="74" height="82" />
              <rect x="1056" y="62" width="42" height="108" />
              <rect x="1110" y="96" width="86" height="74" />
              <rect x="1216" y="46" width="30" height="124" />
              <rect x="1256" y="80" width="60" height="90" />
              <rect x="1330" y="64" width="44" height="106" />
            </g>
            <path className="hero-rail" d="M0 158h1440" />
            <circle className="hero-train" r="5" cy="158" />
          </svg>
          <div className="hero-vignette" />
        </div>
        <div className="hero-marquee relative z-10 border-b border-white/10" aria-hidden="true">
          <div className="marquee-track flex w-max gap-8 py-3">
            {[...site.highlights, ...site.highlights].map((item, index) => (
              <span key={`${item}-${index}`} className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F6D3B8]">{item}</span>
            ))}
          </div>
        </div>
        <div className="page relative z-10 grid items-center gap-10 py-16 lg:min-h-[78vh] lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="rise">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F6D3B8]">{content.hero.kicker}</p>
            <p className="mt-3 text-sm text-white/70">{content.hero.organiser}</p>
            <h1 className="hero-title mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[0.95] sm:text-6xl">{content.hero.title}</h1>
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
            <div className="logo-ring hero-ring-2 absolute inset-[12%] rounded-full border border-[#F6D3B8]/30" aria-hidden="true" />
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

      <LeadershipRotator
        people={content.leadership.people}
        backdrop={["/scenes/infrastructure.jpg", "/scenes/roads.webp", "/scenes/industry.png"]}
      />

      <section className="page py-14" id="about">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <p className="kicker">{site.departmentKicker}</p>
            <h2 className="mt-2 h-section">{site.departmentTitle}</h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-mute">{site.departmentBody}</p>
            <h2 className="mt-12 h-section">{content.about.title}</h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-mute">{content.about.paragraphs[1]}</p>
          </Reveal>
          <div className="scene-photo relative h-72 overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(11,31,58,0.16)] sm:h-96 lg:h-[440px]">
            <PhotoCrossfade images={aboutFrames} />
          </div>
        </div>
        <Reveal stagger>
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-navy-900">{site.highlightsTitle}</h3>
            <ul className="mt-4 flex flex-wrap gap-3">
              {site.highlights.map((item, index) => (
                <li key={item} className="pop-in shine-card card-lift rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm text-navy-900" style={{ "--i": index } as CSSProperties}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-navy-900">{site.audienceTitle}</h3>
            <ul className="mt-4 flex flex-wrap gap-3">
              {site.audience.map((item, index) => (
                <li key={item} className="pop-in shine-card card-lift rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm font-medium text-navy-900" style={{ "--i": index } as CSSProperties}>{item}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="relative overflow-hidden bg-white py-14" id="agenda">
        <img src="/scenes/roads.webp" alt="" className="agenda-wash pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 object-cover lg:block" />
        <div className="page relative">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="h-section">{content.agenda.title}</h2>
              <Link href="/agenda" className="text-sm font-semibold text-saffron-700">{ui.viewAgenda}</Link>
            </div>
            <p className="mt-3 max-w-3xl text-sm text-mute">{content.agenda.intro}</p>
          </Reveal>
          <Reveal stagger>
            <ol className="mt-8 grid gap-4 lg:grid-cols-2">
              {content.agenda.items.map((item, index) => (
                <li key={`${item.time}-${item.title}`} className="pop-in shine-card card card-lift" style={{ "--i": index } as CSSProperties}>
                  <p className="text-sm font-semibold text-saffron-700">{item.time}</p>
                  <h3 className="mt-1 text-lg font-semibold text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute">{item.detail}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="page py-14" id="panels">
        <Reveal>
          <p className="kicker">Sessions</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h2 className="h-section">{content.sectors.title}</h2>
            <Link href="/sectors" className="text-sm font-semibold text-saffron-700">{ui.readMore}</Link>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-mute">{content.sectors.intro}</p>
        </Reveal>
        <Reveal stagger>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {content.sectors.items.map((panel, index) => (
              <article key={panel.slug} className="pop-in glow-card shine-card card card-lift border-t-4 border-t-saffron-700" style={{ "--i": index } as CSSProperties}>
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
        </Reveal>
      </section>

      <section className="relative overflow-hidden bg-[#f7f4ef] py-14">
        <div className="ambient-orb ambient-orb-a" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-b" aria-hidden="true" />
        <div className="page relative">
          <Reveal>
            <h2 className="h-section">{content.whyInvest.title}</h2>
            <p className="mt-3 max-w-3xl text-mute">{content.whyInvest.intro}</p>
          </Reveal>
          <Reveal stagger>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {content.whyInvest.items.map((item, index) => (
                <article key={item.title} className="pop-in glow-card shine-card card card-lift" style={{ "--i": index } as CSSProperties}>
                  <span className="icon-float inline-flex"><Icon name={item.icon} /></span>
                  <h3 className="mt-3 text-lg font-semibold text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute">{item.summary}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-navy-900/10 bg-[#f7f4ef]">
        <Reveal stagger className="page grid gap-4 py-8 md:grid-cols-3">
          {[
            [site.hostKicker, site.hostCity],
            [ui.dates, content.hero.dates],
            [ui.venue, content.hero.venue],
          ].map(([label, value], index) => (
            <div key={label} className="pop-in glow-card shine-card fact-tile rounded-2xl bg-white px-4 py-3" style={{ "--i": index } as CSSProperties}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-saffron-700">{label}</p>
              <p className="mt-1 text-base font-normal leading-snug text-navy-950">{value}</p>
            </div>
          ))}
        </Reveal>
      </section>

    </>
  );
}

const aboutFrames = [
  "/scenes/infrastructure.jpg",
  "/scenes/roads.webp",
  "/scenes/transit.jpg",
  "/scenes/industry.png",
  "/scenes/healthcare.png",
  "/scenes/digital.jpg",
  "/scenes/education.jpg",
];
