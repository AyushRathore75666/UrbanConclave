import type { Metadata } from "next";
import { getLocale } from "@/lib/content";
import { getUi } from "@/lib/ui";
import { StatusLookup } from "@/components/status-lookup";
import { InnerHero } from "@/components/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const ui = getUi(await getLocale());
  return { title: ui.status.title, description: ui.status.intro };
}

export default async function StatusPage() {
  const ui = getUi(await getLocale());
  return (
    <>
      <InnerHero title={ui.status.title} lede={ui.status.intro} />
      <StatusLookup ui={ui} />
    </>
  );
}
