"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useShop } from "@/lib/shop";
import { BASIC_PLAN, PRO_PLAN, PRODUCT, planState, upgradeUrl, fmtDate } from "@/lib/plans";

// Shows the current Expense Tracker plan (trial / Basic / ended) with an Upgrade button that opens WhatsApp.
// compact = shorter version for the dashboard home page.
export default function PlanCard({ compact = false }: { compact?: boolean }) {
  const { shop, ents } = useShop();
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => setEmail(session?.user?.email ?? null));
  }, []);

  if (!shop || shop.status !== "approved") return null;
  const ex = ents.find((e) => e.product === "expenses");
  if (!ex) return null; // trial not started yet: ShopGate shows its own screen
  const st = planState(ex);
  const renew = st.kind === "paid";

  const badge =
    st.kind === "paid"
      ? { text: "Basic plan active", cls: "bg-green-100 text-green-700" }
      : st.kind === "trial"
        ? { text: `Free trial · ${st.days} day${st.days === 1 ? "" : "s"} left`, cls: "bg-amber-100 text-amber-700" }
        : { text: "Trial ended · view only", cls: "bg-red-100 text-red-700" };

  return (
    <div className="card p-4 md:p-5 text-left">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        <span className={`text-[11px] font-bold rounded-full px-2.5 py-1 ${badge.cls}`}>{badge.text}</span>
        {st.until && <span className="text-[11px] text-masala-brown/50">{st.kind === "ended" ? "Ended" : "Until"} {fmtDate(st.until)}</span>}
      </div>

      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={`${compact ? "text-xl" : "text-2xl"} font-extrabold`}>₹{BASIC_PLAN.monthly}</span>
        <span className="text-xs text-masala-brown/60">/ month · Basic plan · {PRODUCT}</span>
      </div>
      <p className="text-xs text-masala-brown/60 mb-2">or ₹{BASIC_PLAN.yearly} / year (save about a third)</p>

      {!compact && (
        <ul className="list-disc pl-5 mb-3 text-sm space-y-1 text-masala-brown/80">
          {BASIC_PLAN.features.map((f) => <li key={f}>{f}</li>)}
        </ul>
      )}

      <a className={`${renew ? "btn-ghost" : "btn-primary"} w-full flex items-center justify-center text-center`}
        href={upgradeUrl(shop, email, renew)} target="_blank" rel="noopener noreferrer">
        {renew ? "🔄 Renew plan on WhatsApp" : "⭐ Upgrade to Basic plan"}
      </a>
      <p className="text-[11px] text-masala-brown/50 mt-1.5 text-center">Opens WhatsApp with a ready message. We activate your plan after payment.</p>

      <div className="mt-3.5 pt-3.5 border-t border-dashed border-masala-brown/15">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold bg-masala-brown text-white rounded-full px-2 py-0.5">PRO</span>
          <span className={`${compact ? "text-base" : "text-lg"} font-extrabold`}>₹{PRO_PLAN.monthly}</span>
          <span className="text-xs text-masala-brown/60">/ month · or ₹{PRO_PLAN.yearly} / year</span>
        </div>
        <p className="text-xs text-masala-brown/60 mt-1 mb-2">For shops with helpers: your staff can bill, but cannot see your sales totals.</p>
        {!compact && (
          <ul className="list-disc pl-5 mb-3 text-sm space-y-1 text-masala-brown/80">
            {PRO_PLAN.features.map((f) => <li key={f}>{f}</li>)}
          </ul>
        )}
        <a className="btn-ghost w-full flex items-center justify-center text-center text-sm"
          href={upgradeUrl(shop, email, false, "pro")} target="_blank" rel="noopener noreferrer">
          💬 Ask about Pro plan
        </a>
      </div>
    </div>
  );
}
