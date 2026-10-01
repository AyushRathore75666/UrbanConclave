import type { Metadata } from "next";
import Image from "next/image";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { InnerHero } from "@/components/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.media.title, content.meta.siteName), description: content.media.intro };
}

export default async function MediaPage() {
  const content = await getContent(await getLocale());
  return (
    <>
      <InnerHero title={content.media.title} lede={content.media.intro} />
      <section className="page py-12">
        <div className="grid gap-4 md:grid-cols-2">
          {content.media.videos.map((video) => (
            <article key={video.title} className="card bg-navy-950 text-white">
              <h2 className="font-serif text-2xl">{video.title}</h2>
              <p className="mt-2 text-sm text-white/75">{video.caption}</p>
              {video.url ? (
                <a className="btn-accent mt-4" href={video.url}>Play</a>
              ) : null}
            </article>
          ))}
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {content.media.gallery.map((shot) => (
            <li key={shot.src} className="overflow-hidden rounded-2xl border border-navy-900/10 bg-white">
              <Image src={shot.src} alt={shot.alt} width={800} height={520} className="h-56 w-full object-cover" />
              <p className="px-4 py-3 text-sm">{shot.caption}</p>
            </li>
          ))}
        </ul>
        <h2 className="mt-12 font-serif text-3xl text-navy-950">News</h2>
        <ul className="mt-4 space-y-4">
          {content.media.news.map((item) => (
            <li key={item.title} className="card">
              <p className="text-xs font-semibold uppercase tracking-wide text-saffron-700">{item.date}</p>
              <h3 className="mt-1 text-lg font-semibold text-navy-900">{item.title}</h3>
              <p className="mt-2 text-sm text-mute">{item.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
