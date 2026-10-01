import Image from "next/image";
import Link from "next/link";
import type { SiteContent } from "@/lib/content";
import type { Ui } from "@/lib/ui";
import { Icon } from "./icons";
import { JsonLd } from "@/components/page-shell";
import { Reveal } from "./reveal";

export function HomePage({ content, ui }: { content: SiteContent; ui: Ui }) {
  return (
    <>
      <JsonLd content={content} />
      <div className="overflow-hidden border-b border-navy-900/10 bg-white py-3" aria-hidden="true">
        <div className="marquee-track flex w-max gap-8 px-4">
          {[...content.sectors.items, ...content.sectors.items].map((sector, index) => (
            <span key={`${sector.slug}-${index}`} className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.16em] text-navy-900">
              {sector.title}
              <span className="ml-8 text-saffron-700">●</span>
            </span>
          ))}
        </div>
      </div>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="logo-glow absolute -left-24 top-10 h-80 w-80 rounded-full bg-saffron-500/20 blur-3xl" />
          <div className="logo-glow absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
        </div>
        <div className="page relative grid items-center gap-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="rise">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F6D3B8]">{content.hero.kicker}</p>
            <p className="mt-3 text-sm text-white/70">{content.hero.organiser}</p>
            <h1 className="mt-4 font-serif text-5xl font-semibold leading-none sm:text-6xl lg:text-7xl">{content.hero.title}</h1>
            <p className="mt-4 text-2xl text-white/90">{content.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/invest" className="btn-accent">{ui.investNow}</Link>
              <a href="/downloads/brochure.pdf" className="btn-ghost">{ui.downloadBrochure}</a>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[440px]">
            <div className="logo-glow absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(224,112,32,0.45),transparent_68%)]" aria-hidden="true" />
            <div className="logo-ring absolute inset-[4%] rounded-full border border-dashed border-[#F6D3B8]/50" aria-hidden="true" />
            <Image
              src="/brand/gis-mark-clear.png"
              alt="MP Conclave GIS emblem"
              width={512}
              height={512}
              priority
              className="logo-float relative z-10 h-full w-full object-contain"
            />
          </div>
        </div>
        <div className="page relative pb-12">
          <dl className="grid gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm sm:grid-cols-3 sm:p-6">
            <Fact label={ui.dates} value={content.hero.dates} />
            <Fact label={ui.venue} value={content.hero.venue} />
            <Fact label={ui.theme} value={content.hero.theme} />
          </dl>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-navy-950 text-white" aria-label={content.media.title}>
        <div className="absolute inset-0">
          {[
            ["/brand/summit-banner.jpg", "object-center"],
            ["/brand/leaders.png", "object-top"],
            ["/brand/summit-banner.jpg", "object-left"],
          ].map(([src, position], index) => (
            <img key={`${src}-${index}`} src={src} alt="" className={`film-slide kenburns absolute inset-0 h-full w-full object-cover ${position}`} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-navy-950/30" />
        </div>
        <div className="page relative grid items-end gap-8 py-16 lg:min-h-[420px] lg:grid-cols-[1fr_1fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F6D3B8]">{content.media.title}</p>
            <h2 className="mt-3 max-w-xl font-serif text-4xl font-semibold">{content.hero.theme}</h2>
            <p className="mt-4 max-w-lg text-white/80">{content.media.intro}</p>
            <Link href="/media" className="btn-accent mt-6">{ui.readMore}</Link>
          </div>
        </div>
      </section>

      <section className="page py-14">
        <Reveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {content.stats.map((stat, index) => (
            <article key={stat.label} className="card card-lift" style={{ animationDelay: `${index * 70}ms` }}>
              <p className="font-serif text-4xl font-semibold text-navy-900">{stat.value}</p>
              <p className="mt-1 text-sm text-mute">{stat.label}</p>
            </article>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-sm text-mute">{content.statsDisclaimer}</p>
        </Reveal>
      </section>

      <section className="bg-white py-14">
        <div className="page">
          <p className="kicker">Madhya Pradesh</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h2 className="h-section">{content.whyInvest.title}</h2>
            <Link href="/why-invest" className="text-sm font-semibold text-saffron-700">{ui.readMore}</Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {content.whyInvest.items.map((item) => (
              <article key={item.title} className="card card-lift">
                <Icon name={item.icon} />
                <h3 className="mt-3 text-lg font-semibold text-navy-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{item.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page py-14">
        <p className="kicker">Sectors</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-section">{content.sectors.title}</h2>
          <Link href="/sectors" className="text-sm font-semibold text-saffron-700">{ui.readMore}</Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.sectors.items.map((sector, index) => (
            <Link key={sector.slug} href={`/sectors/${sector.slug}`} className="card card-lift block border-t-4 border-t-saffron-700">
              <p className="text-xs font-semibold text-mute">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-lg font-semibold text-navy-900">{sector.title}</h3>
              <p className="mt-2 text-sm text-mute">{sector.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-navy-950 py-14 text-white">
        <div className="page">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F6D3B8]">{content.leadership.title}</p>
          <p className="mt-3 max-w-3xl text-white/75">{content.leadership.intro}</p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {content.leadership.people.map((person) => (
              <article key={person.name} className="grid gap-4 rounded-2xl bg-white/5 p-4 sm:grid-cols-[180px_1fr]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-black">
                  <img
                    src="/brand/leaders.png"
                    alt=""
                    className={`absolute top-0 h-[132%] w-[210%] max-w-none ${person.crop === "right" ? "right-0" : "left-0"}`}
                  />
                </div>
                <div>
                  <h3 className="font-serif text-2xl">{person.name}</h3>
                  <p className="mt-1 text-sm text-[#F6D3B8]">{person.role}</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/80">{person.message}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-section">{content.agenda.title}</h2>
          <Link href="/agenda" className="text-sm font-semibold text-saffron-700">{ui.readMore}</Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {content.agendaHighlights.map((item) => (
            <article key={item.track} className="card card-lift">
              <h3 className="font-semibold text-navy-900">{item.track}</h3>
              <p className="mt-2 text-sm text-mute">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="page">
          <h2 className="h-section">{ui.journeyTitle}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {content.journey.map((step) => (
              <li key={step.step} className="card card-lift">
                <p className="font-serif text-3xl text-saffron-700">{step.step}</p>
                <h3 className="mt-2 text-lg font-semibold text-navy-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{step.body}</p>
              </li>
            ))}
          </ol>
          <Link href="/invest" className="btn-primary mt-8">{ui.cta}</Link>
        </div>
      </section>

      <section className="page py-14">
        <h2 className="h-section">{content.testimonials.title}</h2>
        <p className="mt-3 max-w-3xl text-sm text-mute">{content.testimonials.intro}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {content.testimonials.items.map((item, index) => (
            <blockquote key={index} className="card">
              <p className="text-lg leading-relaxed text-navy-900">“{item.quote}”</p>
              <footer className="mt-4 text-sm text-mute">
                <span className="font-semibold text-navy-900">{item.name}</span>
                <span> · {item.organisation}</span>
              </footer>
            </blockquote>
          ))}
        </div>
        <h2 className="mt-12 font-serif text-2xl font-semibold text-navy-950">{content.partners.title}</h2>
        <p className="mt-2 text-sm text-mute">{content.partners.intro}</p>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {content.partners.items.map((partner) => (
            <li key={partner.name} className="flex h-20 items-center justify-center rounded-xl border border-dashed border-navy-900/20 bg-white text-sm font-semibold text-navy-900">
              {partner.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white py-14">
        <div className="page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="h-section">{content.media.title}</h2>
            <Link href="/media" className="text-sm font-semibold text-saffron-700">{ui.readMore}</Link>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {content.media.videos.map((video) => (
              <article key={video.title} className="card flex min-h-40 flex-col justify-between bg-navy-950 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#F6D3B8]">Video</p>
                  <h3 className="mt-2 font-serif text-2xl">{video.title}</h3>
                </div>
                <p className="text-sm text-white/70">{video.caption}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 overflow-hidden">
            <ul className="marquee-track flex w-max gap-4">
              {[...content.media.gallery, ...content.media.gallery].map((shot, index) => (
                <li key={`${shot.src}-${index}`} className="w-64 shrink-0 overflow-hidden rounded-xl border border-navy-900/10 bg-white">
                  <Image src={shot.src} alt={index < content.media.gallery.length ? shot.alt : ""} width={640} height={420} className="h-40 w-full object-cover" />
                  <p className="px-3 py-2 text-sm">{shot.caption}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="page py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-section">{content.downloads.title}</h2>
          <Link href="/downloads" className="text-sm font-semibold text-saffron-700">{ui.readMore}</Link>
        </div>
        <ul className="mt-6 divide-y divide-navy-900/10 rounded-2xl border border-navy-900/10 bg-white">
          {content.downloads.items.map((item) => (
            <li key={item.file} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-navy-900">{item.title}</p>
                <p className="text-sm text-mute">{item.description}</p>
              </div>
              <a className="btn-line" href={item.file}>PDF</a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/20 pt-3">
      <dt className="text-xs uppercase tracking-[0.16em] text-white/60">{label}</dt>
      <dd className="mt-1 text-base font-semibold">{value}</dd>
    </div>
  );
}
