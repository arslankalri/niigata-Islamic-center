import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/members")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
    return { email: data.user.email ?? "" };
  },
  head: () => ({
    meta: [
      { title: "Members area | Islamic Center Niigata" },
      { name: "description", content: "Members area for Islamic Center Niigata." },
      { property: "og:title", content: "Members area | Islamic Center Niigata" },
      { property: "og:description", content: "Members area for Islamic Center Niigata." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MembersArea,
});

function MembersArea() {
  const { email } = Route.useRouteContext();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Members area</h1>
          <p className="text-sm text-muted-foreground">Signed in as {email}</p>
        </div>
        <button onClick={signOut} className="rounded-md border border-input px-4 py-2 text-sm text-foreground">Sign out</button>
      </div>
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <p className="text-foreground">
          Welcome to the members area of Islamic Center Niigata. Member-only content and features will appear here as they are added.
        </p>
      </div>
    </div>
  );
}
