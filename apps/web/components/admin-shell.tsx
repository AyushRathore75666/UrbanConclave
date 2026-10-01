"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminJson, clearToken, token, type AdminUser } from "@/lib/admin";

const LINKS = [
  ["/admin", "Dashboard", ["SUPER_ADMIN", "INVESTMENT_TEAM", "VIEWER", "CONTENT_EDITOR"]],
  ["/admin/submissions", "Interests", ["SUPER_ADMIN", "INVESTMENT_TEAM", "VIEWER"]],
  ["/admin/content", "Content", ["SUPER_ADMIN", "CONTENT_EDITOR"]],
  ["/admin/audit", "Audit log", ["SUPER_ADMIN", "VIEWER"]],
  ["/admin/users", "Users", ["SUPER_ADMIN"]],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (!token()) {
      router.replace("/admin/login");
      return;
    }
    adminJson<AdminUser>("/api/admin/me")
      .then(setUser)
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  if (!user) return <p className="p-8 text-mute">Opening the admin panel…</p>;

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-navy-900/10 bg-navy-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <Link href="/admin" className="font-serif text-lg">MP Conclave GIS</Link>
          <nav className="flex flex-wrap gap-3 text-sm">
            {LINKS.filter((item) => (item[2] as readonly string[]).includes(user.role)).map(([href, label]) => (
              <Link key={href} href={href} className={pathname === href ? "font-semibold text-white" : "text-white/70"}>
                {label}
              </Link>
            ))}
          </nav>
          <p className="ml-auto text-sm text-white/80">{user.name} · {user.role.replaceAll("_", " ")}</p>
          <button
            type="button"
            className="text-sm underline"
            onClick={() => {
              clearToken();
              router.replace("/admin/login");
            }}
          >
            Sign out
          </button>
          <Link href="/" className="text-sm underline">Public site</Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
