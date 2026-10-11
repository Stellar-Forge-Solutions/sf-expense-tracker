"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [f, setF] = useState<Record<string, string>>({ name: "", owner_name: "", mobile: "", whatsapp: "", email: "", password: "", city: "", business_type: "", ref_link: "", company_site: "" });
  const [same, setSame] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const field = (label: string, k: string, props: any = {}) => (
    <div className="mb-3"><label className="text-sm font-medium">{label}</label>
      <input className="input mt-1" value={f[k]} onChange={set(k)} {...props} /></div>);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setBusy(true);
    const r = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, whatsapp: same ? f.mobile : f.whatsapp }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setBusy(false); return setErr(j.error || "Could not sign up"); }
    const { error } = await createClient().auth.signInWithPassword({ email: f.email.trim(), password: f.password });
    setBusy(false);
    if (error) setErr(error.message); else router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <form onSubmit={submit} className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-full bg-masala-gradient flex items-center justify-center"><img src="/sf-mark-light.png" alt="" className="w-7 h-7" /></div>
          <div><h1 className="font-bold text-lg leading-tight">Stellar Forge</h1><p className="text-xs text-masala-brown/60">Start your 15-day free trial</p></div>
        </div>
        {field("Shop name", "name", { required: true, maxLength: 80 })}
        {field("Owner name", "owner_name", { required: true, maxLength: 80 })}
        {field("Mobile number", "mobile", { required: true, inputMode: "numeric", maxLength: 14 })}
        <label className="text-xs flex items-center gap-2 mb-3"><input type="checkbox" checked={same} onChange={(e) => setSame(e.target.checked)} /> WhatsApp number is the same</label>
        {!same && field("WhatsApp number", "whatsapp", { required: true, inputMode: "numeric", maxLength: 14 })}
        {field("Email", "email", { type: "email", required: true })}
        {field("Password (8+ characters)", "password", { type: "password", required: true, minLength: 8 })}
        {field("City", "city")}
        {field("Type of business", "business_type")}
        {field("Google Maps / Instagram / website (optional)", "ref_link", { placeholder: "https://" })}
        <input name="company_site" value={f.company_site} onChange={set("company_site")} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
        {err && <p className="text-masala-red text-sm mb-3">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
        <p className="text-xs text-masala-brown/50 mt-4">We review every new shop within 1 hour (9 am – 9 pm IST) and message you on WhatsApp. Your trial starts when you are approved.</p>
      </form>
      <Link href="/login" className="text-sm mt-4 underline">Already have an account? Sign in</Link>
      <p className="text-[11px] text-masala-brown/40 mt-4">Powered by Stellar Forge</p>
    </div>
  );
}
