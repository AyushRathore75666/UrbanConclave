import { getContent, getLocale } from "@/lib/content";
import { getUi } from "@/lib/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const ui = getUi(locale);
  const content = await getContent(locale);
  return (
    <>
      <a className="skip-link" href="#main">
        {ui.skip}
      </a>
      <SiteHeader ui={ui} locale={locale} />
      <main id="main">{children}</main>
      <SiteFooter ui={ui} content={content} />
    </>
  );
}
