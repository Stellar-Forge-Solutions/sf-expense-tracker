// Legacy: Starts this shop's own Expense Tracker free plan (backward-compatible with old clients).
// Delegates to the new activate-free-plan logic.
import { createClient } from "@supabase/supabase-js";
import { json } from "../../_lib/http.js";

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const jwt = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
  const { data: { user } } = await sb.auth.getUser(jwt);
  if (!user) return json({ error: "Not signed in" }, 401);

  const { data: shop } = await sb.from("shops").select("id, status").eq("owner_id", user.id).maybeSingle();
  if (!shop) return json({ error: "Shop not found" }, 404);
  if (shop.status !== "approved") return json({ error: "Your account is not approved yet. Contact Stellar Forge." }, 403);

  // Check if already activated
  const { data: existing } = await sb
    .from("entitlements")
    .select("id")
    .eq("shop_id", shop.id)
    .eq("product", "expenses")
    .maybeSingle();

  if (existing) return json({ ok: true });

  // Try new column insert first, fall back to RPC
  const { error } = await sb.from("entitlements").insert({
    shop_id: shop.id,
    product: "expenses",
    plan_tier: "free",
    plan_start: new Date().toISOString().slice(0, 10),
  });

  if (error) {
    const { error: rpcError } = await sb.rpc("start_trial", { p_shop: shop.id, p_product: "expenses" });
    if (rpcError) return json({ error: "Your account could not be activated, or your account is not approved yet. Contact Stellar Forge." }, 409);
  }

  return json({ ok: true });
}
