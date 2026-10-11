import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";

// Starts this shop's own 15-day Expense Tracker trial (once per email).
export async function POST(req: NextRequest) {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  const { data: { user } } = await sb.auth.getUser(jwt);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data: shop } = await sb.from("shops").select("id").eq("owner_id", user.id).maybeSingle();
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  const { error } = await sb.rpc("start_trial", { p_shop: shop.id, p_product: "expenses" });
  if (error) return NextResponse.json({ error: "Your free trial for this product was already used, or your account is not approved yet. Contact Stellar Forge." }, { status: 409 });
  return NextResponse.json({ ok: true });
}
