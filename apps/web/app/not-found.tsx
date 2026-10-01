import Link from "next/link";
import { getUi } from "@/lib/ui";
import { getLocale } from "@/lib/content";

export default async function NotFound() {
  const ui = getUi(await getLocale());
  return (
    <section className="page py-24">
      <h1 className="font-serif text-4xl text-navy-950">{ui.notFound}</h1>
      <Link href="/" className="btn-primary mt-8">{ui.backHome}</Link>
    </section>
  );
}
