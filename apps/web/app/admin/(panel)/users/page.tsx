"use client";

import { useEffect, useState } from "react";
import { adminJson } from "@/lib/admin";

type UserRow = { id: string; name: string; email: string; role: string; active: boolean };

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setUsers(await adminJson<UserRow[]>("/api/admin/users"));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await adminJson("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          role: form.get("role"),
        }),
      });
      event.currentTarget.reset();
      setMessage("Account created.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section>
        <h1 className="font-serif text-3xl text-navy-950">Users</h1>
        <ul className="mt-4 space-y-2">
          {users.map((user) => (
            <li key={user.id} className="card">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-mute">{user.email}</p>
              <p className="text-sm">{user.role.replaceAll("_", " ")}</p>
            </li>
          ))}
        </ul>
      </section>
      <form onSubmit={onSubmit} className="card grid gap-3">
        <h2 className="font-semibold">New account</h2>
        <label className="text-sm font-semibold">Name<input className="field" name="name" required /></label>
        <label className="text-sm font-semibold">Email<input className="field" name="email" type="email" required /></label>
        <label className="text-sm font-semibold">Password<input className="field" name="password" type="password" minLength={10} required /></label>
        <label className="text-sm font-semibold">
          Role
          <select className="field" name="role" defaultValue="VIEWER">
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="CONTENT_EDITOR">Content Editor</option>
            <option value="INVESTMENT_TEAM">Investment Team</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </label>
        {message ? <p className="text-sm" role="status">{message}</p> : null}
        {error ? <p className="text-sm text-red-800" role="alert">{error}</p> : null}
        <button className="btn-primary" type="submit">Create account</button>
      </form>
    </div>
  );
}
