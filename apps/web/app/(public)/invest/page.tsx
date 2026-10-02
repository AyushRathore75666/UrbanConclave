import type { Metadata } from "next";
import { getContent, getLocale, pageTitle } from "@/lib/content";
import { getUi } from "@/lib/ui";
import { InvestForm } from "@/components/invest-form";
import { InnerHero } from "@/components/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent(await getLocale());
  return { title: pageTitle(content.form.title, content.meta.siteName), description: content.form.intro };
}

export default async function InvestPage({ searchParams }: { searchParams: Promise<{ sector?: string; session?: string; hcm?: string }> }) {
  const locale = await getLocale();
  const content = await getContent(locale);
  const ui = getUi(locale);
  const params = await searchParams;
  return (
    <>
      <InnerHero title={content.form.title} lede={content.form.intro} />
      <InvestForm
        ui={ui}
        sectors={content.registrationSectors}
        panels={content.sectors.items}
        disclaimer={content.form.disclaimer}
        hcmNote={content.form.hcmNote}
        initialSession={params.session || params.sector}
        requestHcm={params.hcm === "1"}
      />
    </>
  );
}
