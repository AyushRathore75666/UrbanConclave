"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setToken, token } from "@/lib/admin";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (token()) router.replace("/admin");
  }, [router]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/backend/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-MPGIS-Request": "1" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sign-in failed.");
      setToken(data.token);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-navy-950 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8">
        <p className="kicker">Admin</p>
        <h1 className="mt-2 font-serif text-3xl text-navy-950">Sign in</h1>
        <p className="mt-2 text-sm text-mute">Investment team and content accounts are issued by a super admin.</p>
        <label className="mt-6 block text-sm font-semibold">
          Email
          <input className="field" name="email" type="email" autoComplete="username" required />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Password
          <input className="field" name="password" type="password" autoComplete="current-password" required />
        </label>
        {error ? <p className="mt-3 text-sm text-red-800" role="alert">{error}</p> : null}
        <button className="btn-accent mt-6 w-full" disabled={pending} type="submit">{pending ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}
