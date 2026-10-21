"use client";
import { useShop } from "@/lib/shop";
import { upgradeUrl, overageUpgradeUrl, PLANS } from "@/lib/plans";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * EntryUsageWidget — shows monthly entry usage for Free and Basic plans.
 *
 * - Free: "X of 100 entries used this month" + progress bar
 * - At 80%: inline non-blocking notice with upgrade option
 * - Over limit: inline notice shown BEFORE adding an entry
 * - Pro: renders nothing (unlimited)
 *
 * This is a read-only display widget. It does NOT gate access itself;
 * the add-entry forms handle gating.
 */
export default function EntryUsageWidget() {
  const { shop, planResult, usage } = useShop();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });
  }, []);

  const { tier, plan } = planResult;

  // Pro plan: unlimited, don't show widget
  if (tier === "pro") return null;
  // Still loading usage
  if (usage.loading) return null;

  const limit = plan.monthlyEntryLimit;
  const used = usage.monthlyEntries;
  const fraction = used / limit;
  const pct = Math.min(Math.round(fraction * 100), 100);
  const isOver = used >= limit;
  const isWarning = !isOver && fraction >= 0.8;

  const barColor = isOver
    ? "bg-masala-red"
    : isWarning
      ? "bg-amber-500"
      : "bg-green-500";

  const planDef = PLANS[tier];

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
        <p className="text-sm font-semibold text-masala-brown/80">
          Entries this month
        </p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOver ? "bg-masala-red/10 text-masala-red" : isWarning ? "bg-amber-100 text-amber-700" : "bg-green-50 text-green-700"}`}>
          {used} / {limit} used
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-masala-brown/10 overflow-hidden mb-2">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* 80% warning — inline, non-blocking */}
      {isWarning && !isOver && (
        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <span className="font-semibold">Nearly at your limit</span> — {used} of {limit} entries used.
          {tier === "free" && (
            <> Upgrade to Basic (₹{BASIC_PLAN_PRICE}/month) for 400 entries and no ads.{" "}
              <a
                href={upgradeUrl(shop, email)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline whitespace-nowrap"
              >
                Upgrade on WhatsApp ↗
              </a>
            </>
          )}
          {tier === "basic" && (
            <> Extra entries cost ₹{planDef.overageRatePerEntry}/each and are added to your next renewal.</>
          )}
        </div>
      )}

      {/* Over-limit notice — inline, non-blocking */}
      {isOver && (
        <div className="mt-2 p-3 bg-masala-red/5 border border-masala-red/20 rounded-lg text-xs text-masala-red">
          <span className="font-semibold">You&apos;ve used all {limit} included entries.</span>
          {tier === "free" && (
            <> Extra entries cost ₹{planDef.overageRatePerEntry} each, or upgrade to Basic (₹{planDef.overageRatePerEntry > 0 ? "29" : "29"}/month) for 400 entries and no ads.{" "}
              <a
                href={overageUpgradeUrl(shop, email)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline whitespace-nowrap"
              >
                Upgrade to Basic ↗
              </a>
            </>
          )}
          {tier === "basic" && (
            <> Extra entries cost ₹{planDef.overageRatePerEntry} each and are added to your next renewal. You can keep adding entries.</>
          )}
        </div>
      )}

      {/* Link to Usage & Billing */}
      <div className="mt-2 text-right">
        <a href="/usage" className="text-[11px] text-masala-brown/40 hover:text-masala-brown/70 underline">
          View Usage & Billing →
        </a>
      </div>
    </div>
  );
}

// Internal constant reference (avoids circular import issue)
const BASIC_PLAN_PRICE = 29;
