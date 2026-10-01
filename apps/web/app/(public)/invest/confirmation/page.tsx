import type { Metadata } from "next";
import { getLocale } from "@/lib/content";
import { getUi } from "@/lib/ui";
import { Confirmation } from "@/components/confirmation";

export async function generateMetadata(): Promise<Metadata> {
  const ui = getUi(await getLocale());
  return { title: ui.confirmation.title };
}

export default async function ConfirmationPage() {
  const ui = getUi(await getLocale());
  return <Confirmation ui={ui} />;
}
