"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/client";
import { useShop } from "@/lib/shop";
import {
  FREE_PLAN,
  BASIC_PLAN,
  PRO_PLAN,
  PLANS,
  upgradeUrl,
  overageUpgradeUrl,
  fmtDate,
} from "@/lib/plans";

function istYearMonth() {
  const now = new Date();
  const ist = new Date(now.getTime() + 330 * 60_000);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function UsagePage() {
  const { shop, planResult, usage } = useShop();
  const [email, setEmail] = useState<string | null>(null);
  const [overageLimit, setOverageLimit] = useState<string>("50");
  const [savingLimit, setSavingLimit] = useState(false);
  const [limitMsg, setLimitMsg] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });
  }, []);

  const { tier, plan, renewalDate } = planResult;
  const planDef = PLANS[tier];
  const used = usage.monthlyEntries;
  const limit = plan.monthlyEntryLimit;
  const fraction = tier === "pro" ? 0 : Math.min(used / limit, 1);
  const pct = Math.round(fraction * 100);
  const isOver = tier !== "pro" && used >= limit;
  const overageEntries = isOver ? used - limit : 0;
  const overageAmount = overageEntries * plan.overageRatePerEntry;
  const yearMonth = istYearMonth();

  // Overage collection rule: carry forward if < ₹10, otherwise flag for next renewal
  const carryForward = overageAmount > 0 && overageAmount < 10;

  async function saveOverageLimit() {
    setSavingLimit(true);
    setLimitMsg(null);
    const val = parseFloat(overageLimit);
    if (isNaN(val) || val < 0) {
      setLimitMsg("Enter a valid amount (0 or more).");
      setSavingLimit(false);
      return;
    }
    const supabase = createClient();
    const { data: sh } = await supabase.from("shops").select("id").maybeSingle();
    if (!sh) { setLimitMsg("Could not find your shop."); setSavingLimit(false); return; }
    const { error } = await supabase.from("shop_usage").upsert({
      shop_id: sh.id,
      year_month: yearMonth,
      overage_limit: val,
    }, { onConflict: "shop_id,year_month", ignoreDuplicates: false });
    setSavingLimit(false);
    setLimitMsg(error ? error.message : "Saved.");
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Nav />
      <main className="flex-1 p-4 md:p-6 space-y-5 pb-24 max-w-2xl">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Usage &amp; Billing</h1>
          <p className="text-masala-brown/60 text-xs md:text-sm">{yearMonth}</p>
        </div>

        {/* Current plan */}
        <div className="card p-5 space-y-2">
          <h2 className="font-semibold">Current plan</h2>
          <div className="flex items-baseline gap-2">
            <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${
              tier === "pro" ? "bg-purple-100 text-purple-700" :
              tier === "basic" ? "bg-green-100 text-green-700" :
              "bg-masala-brown/10 text-masala-brown/60"
            }`}>
              {planDef.name} plan
            </span>
            {tier === "free" && <span className="text-sm text-masala-brown/50">Free forever</span>}
            {(tier === "basic" || tier === "pro") && renewalDate && (
              <span className="text-sm text-masala-brown/50">Renews {fmtDate(renewalDate)}</span>
            )}
          </div>
          {tier === "free" && (
            <a
              href={upgradeUrl(shop, email, false, "basic")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 text-sm mt-2"
            >
              ⭐ Upgrade to Basic — ₹{BASIC_PLAN.monthlyPrice}/month
            </a>
          )}
          {tier === "basic" && (
            <a
              href={upgradeUrl(shop, email, true, "basic")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2 text-sm mt-2"
            >
              🔄 Renew plan on WhatsApp
            </a>
          )}
        </div>

        {/* Entry usage */}
        {tier !== "pro" && (
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold">Entry usage — {yearMonth}</h2>
            <div className="flex items-center justify-between text-sm">
              <span>{used} of {limit} entries used</span>
              <span className={`font-bold ${isOver ? "text-masala-red" : "text-masala-brown/60"}`}>{pct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-masala-brown/10 overflow-hidden">
              <div
                className={`h-2.5 rounded-full ${isOver ? "bg-masala-red" : pct >= 80 ? "bg-amber-500" : "bg-green-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {overageEntries > 0 && (
              <div className="mt-2 p-3 bg-masala-red/5 border border-masala-red/20 rounded-lg text-sm space-y-1">
                <p><span className="font-semibold text-masala-red">Overage entries:</span> {overageEntries}</p>
                <p><span className="font-semibold">Overage amount:</span> ₹{overageAmount.toFixed(2)} @ ₹{plan.overageRatePerEntry}/entry</p>
                {carryForward ? (
                  <p className="text-masala-brown/60 text-xs">Below ₹10 — will be carried forward to next month or added to your next renewal.</p>
                ) : (
                  <p className="text-masala-brown/60 text-xs">Will be added to your next renewal charge.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Overage limit setting */}
        {tier !== "pro" && (
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold">Monthly overage limit</h2>
            <p className="text-sm text-masala-brown/60">
              Set the maximum overage you are willing to pay per month. When this amount is reached, new entry creation is blocked until the next month.
              Set to <b>₹0</b> to block all entries after the included limit.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">₹</span>
              <input
                className="input w-28"
                type="number"
                min="0"
                step="10"
                value={overageLimit}
                onChange={(e) => setOverageLimit(e.target.value)}
              />
              <button className="btn-primary text-sm px-4 py-2 min-h-0" disabled={savingLimit} onClick={saveOverageLimit}>
                {savingLimit ? "Saving…" : "Save"}
              </button>
            </div>
            {limitMsg && <p className="text-sm text-masala-brown/60">{limitMsg}</p>}
          </div>
        )}

        {/* Pro plan promo */}
        {tier !== "pro" && (
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <span className="bg-masala-brown text-white text-[10px] font-bold px-2 py-0.5 rounded-full">PRO</span>
              Need more?
            </h2>
            <p className="text-sm text-masala-brown/70">Pro plan gives you unlimited entries, no ads, and extra logins for your accountant, manager or partner.</p>
            <a
              href={upgradeUrl(shop, email, false, "pro")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2 text-sm"
            >
              💬 Contact us on WhatsApp
            </a>
          </div>
        )}

        <p className="text-[11px] text-masala-brown/40">Powered by Stellar Forge</p>
      </main>
    </div>
  );
}
