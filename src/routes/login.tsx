import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Member sign in | Islamic Center Niigata" },
      { name: "description", content: "Sign in for invited members of Islamic Center Niigata." },
      { property: "og:title", content: "Member sign in | Islamic Center Niigata" },
      { property: "og:description", content: "Sign in for invited members of Islamic Center Niigata." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MemberLogin,
});

function MemberLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setMsg("Sign in failed. Please check your email and password.");
    navigate({ to: "/members" });
  }

  async function forgot() {
    if (!email) return setMsg("Enter your email above first.");
    setBusy(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    setMsg("If this email is registered, a reset link has been sent.");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Member sign in</h1>
        <p className="text-sm text-muted-foreground">
          For invited members of Islamic Center Niigata. Accounts are created by the center — there is no public registration.
        </p>
        <label className="block text-sm text-foreground">Email
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="block text-sm text-foreground">Password
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
        </label>
        {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}
        <button disabled={busy} className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-60">
          {busy ? "Please wait…" : "Sign in"}
        </button>
        <button type="button" onClick={forgot} disabled={busy} className="w-full text-sm text-muted-foreground underline">
          Forgot password?
        </button>
      </form>
    </div>
  );
}
