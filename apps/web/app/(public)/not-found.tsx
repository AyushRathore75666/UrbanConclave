import type { Metadata } from "next";
import Link from "next/link";
import { getContent, getLocale } from "@/lib/content";
import { getUi } from "@/lib/ui";

export async function generateMetadata(): Promise<Metadata> {
  const ui = getUi(await getLocale());
  return { title: ui.notFound };
}

export default async function NotFound() {
  const locale = await getLocale();
  const ui = getUi(locale);
  return (
    <section className="page py-24">
      <h1 className="h-display">{ui.notFound}</h1>
      <Link href="/" className="btn-primary mt-8">{ui.backHome}</Link>
    </section>
  );
}
