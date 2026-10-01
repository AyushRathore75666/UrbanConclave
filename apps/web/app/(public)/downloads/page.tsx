import type { Metadata } from "next";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { InnerHero } from "@/components/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.downloads.title, content.meta.siteName), description: content.downloads.intro };
}

export default async function DownloadsPage() {
  const content = await getContent(await getLocale());
  return (
    <>
      <InnerHero title={content.downloads.title} lede={content.downloads.intro} />
      <ul className="page divide-y divide-navy-900/10 py-10">
        {content.downloads.items.map((item) => (
          <li key={item.file} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-navy-900">{item.title}</h2>
              <p className="mt-1 text-sm text-mute">{item.description}</p>
            </div>
            <a className="btn-primary" href={item.file}>Download PDF</a>
          </li>
        ))}
      </ul>
    </>
  );
}
