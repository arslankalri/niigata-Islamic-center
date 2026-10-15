import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    return { email: data.user.email ?? "", isAdmin: !!isAdmin };
  },
  head: () => ({
    meta: [
      { title: "Admin dashboard | Islamic Center Niigata" },
      { name: "description", content: "Administrator dashboard for Islamic Center Niigata." },
      { property: "og:title", content: "Admin dashboard | Islamic Center Niigata" },
      { property: "og:description", content: "Administrator dashboard for Islamic Center Niigata." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

type Stats = { total: number; week: number; today: number; top: { path: string; views: number }[]; posts: number };

function AdminDashboard() {
  const { email, isAdmin } = Route.useRouteContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data } = await supabase.from("page_views").select("day,path,views");
      const { count } = await supabase.from("announcements").select("id", { count: "exact", head: true });
      const rows = data ?? [];
      const today = new Date().toISOString().slice(0, 10);
      const weekAgo = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
      const byPath = new Map<string, number>();
      let total = 0, week = 0, t = 0;
      for (const r of rows) {
        total += r.views;
        if (r.day >= weekAgo) week += r.views;
        if (r.day === today) t += r.views;
        byPath.set(r.path, (byPath.get(r.path) ?? 0) + r.views);
      }
      const top = [...byPath].map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 5);
      setStats({ total, week, today: t, top, posts: count ?? 0 });
    })();
  }, [isAdmin]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">Signed in as {email}</p>
        </div>
        <button onClick={signOut} className="rounded-md border border-input px-4 py-2 text-sm text-foreground">Sign out</button>
      </div>
      {!isAdmin ? (
        <p className="mt-8 rounded-xl border border-border bg-card p-6 text-foreground">This account does not have administrator access.</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {[["Today", stats?.today], ["Last 7 days", stats?.week], ["All time", stats?.total], ["Posts in editor", stats?.posts]].map(([label, v]) => (
              <div key={label as string} className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{v ?? "…"}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground">Most visited pages</h2>
            {stats && stats.top.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No visits recorded yet.</p>}
            <ul className="mt-2 space-y-1 text-sm text-foreground">
              {stats?.top.map((p) => <li key={p.path} className="flex justify-between"><span>{p.path}</span><span>{p.views}</span></li>)}
            </ul>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">The announcement editor arrives in the next phase.</p>
        </>
      )}
    </div>
  );
}
