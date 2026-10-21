// Cloudflare Pages Function: activates the Free plan for an approved shop.
// Replaces the legacy /api/start-trial endpoint.
// Also called by the legacy /api/start-trial for backward compatibility.

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

  // Check if entitlement already exists
  const { data: existing } = await sb
    .from("entitlements")
    .select("id")
    .eq("shop_id", shop.id)
    .eq("product", "expenses")
    .maybeSingle();

  if (existing) {
    // Already activated — idempotent success
    return json({ ok: true, message: "Already activated" });
  }

  // Create free plan entitlement
  const { error } = await sb.from("entitlements").insert({
    shop_id: shop.id,
    product: "expenses",
    plan_tier: "free",
    plan_start: new Date().toISOString().slice(0, 10),
  });

  if (error) {
    // Fallback: try legacy start_trial RPC if the new column doesn't exist yet
    const { error: rpcError } = await sb.rpc("start_trial", { p_shop: shop.id, p_product: "expenses" });
    if (rpcError) return json({ error: "Could not activate your account. Please contact Stellar Forge." }, 500);
  }

  return json({ ok: true });
}
