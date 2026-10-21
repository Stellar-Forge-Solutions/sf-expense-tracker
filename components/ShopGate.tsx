"use client";
import { ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useShop } from "@/lib/shop";

const hhmm = (d: string) => new Date(d).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });

function Screen({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();
  async function out() { await createClient().auth.signOut(); router.replace("/login"); }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8 text-center">
        <img src="/sf-mark.png" alt="" className="w-14 mx-auto mb-3" />
        <h1 className="font-bold text-lg mb-3">{title}</h1>
        <div className="text-sm text-masala-brown/70 space-y-3">{children}</div>
        <button className="btn-ghost mt-5 text-sm" onClick={out}>Sign out</button>
        <p className="text-[11px] text-masala-brown/40 mt-3">Powered by Stellar Forge</p>
      </div>
    </div>
  );
}

export default function ShopGate({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { loading, hasSession, shop, ents, reload } = useShop();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (path === "/login" || path === "/signup") return <>{children}</>;
  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-masala-brown/50">Loading...</p></div>;
  if (!hasSession) return <>{children}</>; // each page redirects to /login itself
  if (!shop) return <Screen title="No shop found">This account is not linked to a shop. Please contact Stellar Forge.</Screen>;

  if (shop.status === "pending_review") return (
    <Screen title={`Thanks, ${shop.name}!`}>
      <p>Your account is under review.</p>
      <p>We&apos;ll review it within 1 hour (9 am – 9 pm IST){shop.review_due_at && <> — by <b>{hhmm(shop.review_due_at)} IST</b></>} and WhatsApp you on <b>{shop.whatsapp}</b>.</p>
      <p><b>Refresh this page to keep checking your status.</b></p>
      <button className="btn-primary" onClick={() => reload()}>Check status</button>
    </Screen>);
  if (shop.status === "rejected") return <Screen title="Account not approved">We could not approve this account.{shop.review_note ? ` Note: ${shop.review_note}` : ""} Reply to our email if you think this is a mistake.</Screen>;
  if (shop.status === "suspended") return <Screen title="Account on hold">Your account is on hold. Please contact Stellar Forge to continue.</Screen>;

  // Approved shop — activate free plan if no entitlement yet
  const ex = ents.find((e) => e.product === "expenses");
  if (!ex) {
    const start = async () => {
      setBusy(true); setErr(null);
      const { data: { session } } = await createClient().auth.getSession();
      // Try new endpoint first, fall back to legacy
      const r = await fetch("/api/activate-free-plan", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const j = await r.json().catch(() => ({}));
      setBusy(false);
      if (!r.ok) setErr(j.error || "Could not activate your account"); else reload();
    };
    return (
      <Screen title="Welcome to Stellar Forge!">
        <p>Your account is approved. Activate your free plan to get started.</p>
        <p className="text-xs text-masala-brown/50">Free plan: 100 entries per month included. No credit card needed.</p>
        {err && <p className="text-masala-red">{err}</p>}
        <button className="btn-primary" disabled={busy} onClick={start}>{busy ? "Activating…" : "Start using for free"}</button>
      </Screen>);
  }

  // All approved shops with an entitlement can access the app (no view-only lock for free plan)
  return <>{children}</>;
}
