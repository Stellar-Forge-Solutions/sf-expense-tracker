"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/client";
import { useShop } from "@/lib/shop";

export default function SettingsPage() {
  const supabase = createClient();
  const { shop, ents, canWrite, reload } = useShop();
  const [f, setF] = useState({ name: "", mobile: "", whatsapp: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (shop) setF({ name: shop.name || "", mobile: shop.mobile || "", whatsapp: shop.whatsapp || "" }); }, [shop]);

  const ex = ents.find((e) => e.product === "expenses");
  const billing = ents.find((e) => e.product === "billing");
  const end = ex?.paid_until || ex?.trial_ends_at;

  async function save() {
    const d = (v: string) => v.replace(/\D/g, "").slice(-10);
    if (!f.name.trim() || d(f.mobile).length !== 10 || d(f.whatsapp).length !== 10) return setMsg("Enter the shop name and 10-digit mobile and WhatsApp numbers.");
    setBusy(true);
    const { error } = await supabase.from("shops").update({ name: f.name.trim(), mobile: d(f.mobile), whatsapp: d(f.whatsapp) }).eq("id", shop.id);
    setBusy(false); setMsg(error ? error.message : "Saved"); reload();
  }
  async function toggle(on: boolean) {
    setBusy(true);
    const { error } = await supabase.rpc("set_sales_sync", { p_on: on });
    setBusy(false); setMsg(error ? error.message : on ? "Billing sales connected" : "Billing sales disconnected"); reload();
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Nav />
      <main className="flex-1 p-4 md:p-6 space-y-5 pb-24 max-w-xl">
        <div><h1 className="text-xl md:text-2xl font-bold">Settings</h1>
          <p className="text-masala-brown/60 text-xs md:text-sm">{canWrite ? (ex?.paid_until ? "Plan active" : "Free trial") : "View only"}{end && ` · until ${new Date(end).toLocaleDateString("en-IN")}`}</p></div>
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold">Shop details</h2>
          {(["name", "mobile", "whatsapp"] as const).map((k) => (
            <div key={k}><label className="text-sm font-medium capitalize">{k === "name" ? "Shop name" : k}</label>
              <input className="input mt-1" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>))}
          <button className="btn-primary" disabled={busy || !canWrite} onClick={save}>Save</button>
        </div>
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold">Connect Billing sales</h2>
          <p className="text-sm text-masala-brown/70">Adds each day&apos;s printed bills from Stellar Forge Billing as one automatic sale. Past bills are added too, so remove any manual sales you already entered for the same days to avoid counting them twice.</p>
          {!billing && <p className="text-sm text-masala-red">Billing is not enabled for this login yet. Sign in to Stellar Forge Billing with the same email and start its trial first.</p>}
          {shop?.sync_sales
            ? <button className="btn-ghost" disabled={busy} onClick={() => toggle(false)}>Disconnect (removes automatic billing sales)</button>
            : <button className="btn-primary" disabled={busy || !billing || !canWrite} onClick={() => toggle(true)}>Connect Billing sales</button>}
        </div>
        {msg && <p className="text-sm">{msg}</p>}
        <p className="text-[11px] text-masala-brown/40">Powered by Stellar Forge</p>
      </main>
    </div>
  );
}
