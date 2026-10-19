import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  const projectId = Deno.env.get("LOVABLE_PROJECT_ID") ?? "5858dbb0-6c0a-46de-8bb2-d1653642c1fe";
  if (!supabaseUrl || !anonKey || !lovableApiKey) {
    return json({ error: "Analytics integration is not configured. Add LOVABLE_API_KEY to Supabase Edge Function secrets." }, 503);
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization) return json({ error: "Unauthorized" }, 401);
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);
  const { data: roles, error: roleError } = await userClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .limit(1);
  if (roleError || !roles?.length) return json({ error: "Forbidden" }, 403);

  let body: { start_date?: string; end_date?: string } = {};
  try { body = await req.json(); } catch { /* use default range */ }
  const end = body.end_date && /^\d{4}-\d{2}-\d{2}$/.test(body.end_date)
    ? body.end_date
    : new Date().toISOString().slice(0, 10);
  const defaultStart = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const start = body.start_date && /^\d{4}-\d{2}-\d{2}$/.test(body.start_date)
    ? body.start_date
    : defaultStart;
  if (start > end) return json({ error: "start_date must be on or before end_date" }, 400);

  const headers = { "Lovable-API-Key": lovableApiKey, Accept: "application/json" };
  const base = `https://api.lovable.dev/v1/projects/${encodeURIComponent(projectId)}/analytics`;
  const [analyticsResponse, trendResponse] = await Promise.all([
    fetch(`${base}?start_date=${start}&end_date=${end}&granularity=day`, { headers }),
    fetch(`${base}/trend`, { headers }),
  ]);
  if (!analyticsResponse.ok) {
    const detail = await analyticsResponse.text();
    return json({
      error: `Lovable analytics API returned ${analyticsResponse.status}.`,
      detail: detail.slice(0, 500),
    }, analyticsResponse.status === 401 || analyticsResponse.status === 403 ? 502 : 502);
  }
  const analytics = await analyticsResponse.json();
  let trend: unknown = null;
  if (trendResponse.ok) trend = await trendResponse.json();
  return json({
    analytics,
    trend,
    fetched_at: new Date().toISOString(),
    start_date: start,
    end_date: end,
  });
});
