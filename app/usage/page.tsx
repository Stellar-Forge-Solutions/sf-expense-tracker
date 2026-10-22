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
  fmtDate,
} from "@/lib/plans";
import { inr } from "@/lib/finance";
import { ChevronDown, ChevronUp, FileText, AlertCircle, ShoppingCart, Receipt, HandCoins, Users, UserCheck } from "lucide-react";

function istYearMonth() {
  const now = new Date();
  const ist = new Date(now.getTime() + 330 * 60_000);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Returns the current calendar month bounds in IST (YYYY-MM-DD strings) */
function istMonthBounds() {
  const now = new Date();
  const ist = new Date(now.getTime() + 330 * 60_000);
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth() + 1;
  const mm = String(m).padStart(2, "0");
  const lastDay = new Date(y, m, 0).getDate();
  return {
    start: `${y}-${mm}-01`,
    end: `${y}-${mm}-${String(lastDay).padStart(2, "0")}`,
    yearMonth: `${y}-${mm}`,
  };
}

interface MonthlyEntryItem {
  id: string | number;
  date: string;
  type: "sale" | "purchase" | "expense" | "lend" | "sale_vendor" | "purchase_vendor";
  category: string;
  amount: number;
  created_at: string;
  isOverage: boolean;
  overageCost: number;
}

export default function UsagePage() {
  const { shop, planResult, usage } = useShop();
  const [email, setEmail] = useState<string | null>(null);
  const [overageLimit, setOverageLimit] = useState<string>("50");
  const [savingLimit, setSavingLimit] = useState(false);
  const [limitMsg, setLimitMsg] = useState<string | null>(null);

  // Breakdown state
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [entriesList, setEntriesList] = useState<MonthlyEntryItem[]>([]);

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

  async function loadEntriesBreakdown() {
    if (entriesList.length > 0) {
      setShowBreakdown(!showBreakdown);
      return;
    }

    setLoadingEntries(true);
    setShowBreakdown(true);
    const supabase = createClient();
    const { start, end } = istMonthBounds();

    try {
      const [{ data: txns }, { data: lends }, { data: saleVendors }, { data: purchaseVendors }] = await Promise.all([
        supabase
          .from("transactions")
          .select("id, txn_date, type, amount, category, description, created_at, source")
          .neq("source", "billing")
          .gte("txn_date", start)
          .lte("txn_date", end)
          .order("txn_date", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("lending")
          .select("id, date, amount, person_name, created_at, type")
          .eq("type", "lend")
          .gte("date", start)
          .lte("date", end)
          .order("date", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("sale_vendors")
          .select("id, date, amount, paid_amount, vendor_name, description, bill_no, created_at")
          .gte("date", start)
          .lte("date", end)
          .order("date", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("purchase_vendors")
          .select("id, date, amount, paid_amount, vendor_name, description, bill_no, created_at")
          .gte("date", start)
          .lte("date", end)
          .order("date", { ascending: true })
          .order("created_at", { ascending: true }),
      ]);

      const combined: MonthlyEntryItem[] = [
        ...(txns || []).map((t: any) => ({
          id: t.id,
          date: t.txn_date,
          type: t.type,
          category: t.category || t.description || "General",
          amount: Number(t.amount),
          created_at: t.created_at || t.txn_date,
          isOverage: false,
          overageCost: 0,
        })),
        ...(lends || []).map((l: any) => ({
          id: l.id,
          date: l.date,
          type: "lend" as const,
          category: `Udhari to ${l.person_name}`,
          amount: Number(l.amount),
          created_at: l.created_at || l.date,
          isOverage: false,
          overageCost: 0,
        })),
        ...(saleVendors || []).map((sv: any) => ({
          id: sv.id,
          date: sv.date,
          type: "sale_vendor" as const,
          category: `Sale to ${sv.vendor_name}${sv.bill_no ? ` (${sv.bill_no})` : ""}`,
          amount: Number(sv.amount) || Number(sv.paid_amount) || 0,
          created_at: sv.created_at || sv.date,
          isOverage: false,
          overageCost: 0,
        })),
        ...(purchaseVendors || []).map((pv: any) => ({
          id: pv.id,
          date: pv.date,
          type: "purchase_vendor" as const,
          category: `Purchase from ${pv.vendor_name}${pv.bill_no ? ` (${pv.bill_no})` : ""}`,
          amount: Number(pv.amount) || Number(pv.paid_amount) || 0,
          created_at: pv.created_at || pv.date,
          isOverage: false,
          overageCost: 0,
        })),
      ];

      // Sort chronologically by date and creation
      combined.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.created_at.localeCompare(b.created_at);
      });

      // Mark entries past the included limit as overage
      combined.forEach((item, index) => {
        const itemNumber = index + 1;
        if (tier !== "pro" && itemNumber > limit) {
          item.isOverage = true;
          item.overageCost = plan.overageRatePerEntry;
        }
      });

      setEntriesList(combined);
    } catch (e) {
      console.error("Error loading breakdown:", e);
    } finally {
      setLoadingEntries(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Nav />
      <main className="flex-1 p-4 md:p-6 space-y-5 pb-24 max-w-3xl">
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
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Entry usage — {yearMonth}</h2>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isOver ? "bg-masala-red/10 text-masala-red" : pct >= 80 ? "bg-amber-100 text-amber-700" : "bg-green-50 text-green-700"
              }`}>
                {used} / {limit} entries used
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-masala-brown/10 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all ${isOver ? "bg-masala-red" : pct >= 80 ? "bg-amber-500" : "bg-green-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Overage summary card when over limit */}
            {overageEntries > 0 && (
              <div className="p-4 bg-masala-red/5 border border-masala-red/20 rounded-xl space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-masala-brown/50 block">Included Limit</span>
                    <span className="text-base font-bold text-masala-brown">{limit} entries</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-masala-brown/50 block">Overage Entries</span>
                    <span className="text-base font-bold text-masala-red">{overageEntries} extra</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-masala-brown/50 block">Amount Charged</span>
                    <span className="text-base font-bold text-masala-red">₹{overageAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-masala-red/10 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-masala-brown/70 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-masala-red flex-shrink-0" />
                    {carryForward
                      ? "Overage is below ₹10 — carried forward to next month."
                      : "Overage of ₹10+ will be collected at your next plan renewal."}
                  </span>
                  <span className="text-masala-brown/50">Rate: ₹{plan.overageRatePerEntry}/entry</span>
                </div>
              </div>
            )}

            {/* View entries & charge breakdown toggle */}
            <div className="pt-2">
              <button
                onClick={loadEntriesBreakdown}
                className="btn-ghost w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 min-h-0"
              >
                <FileText size={15} />
                {showBreakdown ? "Hide entries & charge breakdown" : "View entries & amount charged for this month"}
                {showBreakdown ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            </div>

            {/* Detailed itemized breakdown */}
            {showBreakdown && (
              <div className="mt-4 pt-4 border-t border-masala-brown/10 space-y-3">
                <div className="flex items-center justify-between text-xs text-masala-brown/60">
                  <span>Showing {entriesList.length} manual entries in {yearMonth}</span>
                  <span>Billing auto-synced sales are excluded</span>
                </div>

                {loadingEntries ? (
                  <p className="text-xs text-masala-brown/50 text-center py-4">Loading entries…</p>
                ) : entriesList.length === 0 ? (
                  <p className="text-xs text-masala-brown/50 text-center py-4">No manual entries recorded this month.</p>
                ) : (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-xl border border-masala-brown/10 bg-white/50">
                    <table className="data-table w-full text-xs">
                      <thead className="sticky top-0 bg-masala-cream/90 backdrop-blur-sm z-10">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Type</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2 text-right">Amount</th>
                          <th className="px-3 py-2 text-right">Charge Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entriesList.map((entry, idx) => {
                          const num = idx + 1;
                          return (
                            <tr key={entry.id} className={entry.isOverage ? "bg-masala-red/5" : ""}>
                              <td className="px-3 py-2 text-masala-brown/50 font-mono text-[11px]">{num}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-masala-brown/70">{new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                              <td className="px-3 py-2 capitalize font-medium">
                                <span className="inline-flex items-center gap-1">
                                  {entry.type === "sale" && <ShoppingCart size={12} className="text-green-600" />}
                                  {entry.type === "expense" && <Receipt size={12} className="text-amber-600" />}
                                  {entry.type === "lend" && <HandCoins size={12} className="text-masala-red" />}
                                  {entry.type === "sale_vendor" && <Users size={12} className="text-blue-600" />}
                                  {entry.type === "purchase_vendor" && <UserCheck size={12} className="text-purple-600" />}
                                  {entry.type === "sale_vendor" ? "Sale Vendor" : entry.type === "purchase_vendor" ? "Purchase Vendor" : entry.type}
                                </span>
                              </td>
                              <td className="px-3 py-2 max-w-[140px] truncate text-masala-brown/80">{entry.category}</td>
                              <td className="px-3 py-2 text-right font-medium text-masala-brown">{inr(entry.amount)}</td>
                              <td className="px-3 py-2 text-right whitespace-nowrap">
                                {entry.isOverage ? (
                                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-masala-red/10 text-masala-red border border-masala-red/20">
                                    Overage: +₹{entry.overageCost.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700">
                                    Included
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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
