"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useShop } from "@/lib/shop";
import {
  FREE_PLAN,
  BASIC_PLAN,
  PRO_PLAN,
  PRODUCT,
  upgradeUrl,
  fmtDate,
} from "@/lib/plans";

// Shows the Free / Basic / Pro plan cards with upgrade options.
// compact = shorter version for the dashboard home page.

export default function PlanCard({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { shop, planResult } = useShop();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        setEmail(session?.user?.email ?? null);
      });
  }, []);

  if (!shop || shop.status !== "approved") {
    return null;
  }

  const { tier, isLegacyPaid, renewalDate } = planResult;

  const badge =
    tier === "pro"
      ? { text: "Pro plan active", cls: "bg-purple-100 text-purple-700" }
      : tier === "basic"
        ? isLegacyPaid
          ? { text: "Basic plan (legacy)", cls: "bg-green-100 text-green-700" }
          : { text: "Basic plan active", cls: "bg-green-100 text-green-700" }
        : { text: "Free plan", cls: "bg-masala-brown/10 text-masala-brown/70" };

  return (
    <div className="card p-4 md:p-5 text-left">
      {/* Current plan badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <span className={`text-[11px] font-bold rounded-full px-2.5 py-1 ${badge.cls}`}>
          {badge.text}
        </span>
        {renewalDate && (
          <span className="text-[11px] text-masala-brown/50">
            {tier === "basic" || tier === "pro" ? "Renews" : "Until"}{" "}
            {fmtDate(renewalDate)}
          </span>
        )}
      </div>

      {/* Plan cards — Free / Basic / Pro */}
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}>
        {/* Free card */}
        <div className={`rounded-xl border-2 p-3 ${tier === "free" ? "border-masala-red bg-masala-red/3" : "border-masala-brown/10"}`}>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-xs font-bold uppercase tracking-wide text-masala-brown/50">Free</span>
            {tier === "free" && <span className="text-[10px] bg-masala-red text-white rounded-full px-1.5 py-0.5 font-bold ml-auto">Current</span>}
          </div>
          <p className="text-xl font-extrabold">₹0</p>
          {!compact && (
            <ul className="text-xs text-masala-brown/60 mt-2 space-y-1">
              <li>• {FREE_PLAN.monthlyEntryLimit} entries/month</li>
              <li>• ₹{FREE_PLAN.overageRatePerEntry} per extra entry</li>
              <li>• Ad-supported</li>
              <li>• All app features included</li>
            </ul>
          )}
        </div>

        {/* Basic card */}
        <div className={`rounded-xl border-2 p-3 ${tier === "basic" ? "border-green-500 bg-green-50/40" : "border-masala-brown/10"}`}>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-xs font-bold uppercase tracking-wide text-masala-brown/50">Basic</span>
            {tier === "basic" && <span className="text-[10px] bg-green-600 text-white rounded-full px-1.5 py-0.5 font-bold ml-auto">Current</span>}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold">₹{BASIC_PLAN.monthlyPrice}</span>
            <span className="text-xs text-masala-brown/50">/month</span>
          </div>
          <p className="text-[11px] text-masala-brown/50">or ₹{BASIC_PLAN.yearlyPrice}/year</p>
          {!compact && (
            <ul className="text-xs text-masala-brown/60 mt-2 space-y-1">
              <li>• {BASIC_PLAN.monthlyEntryLimit} entries/month</li>
              <li>• ₹{BASIC_PLAN.overageRatePerEntry} per extra entry</li>
              <li>• No ads</li>
              <li>• Everything in Free</li>
            </ul>
          )}
          {tier !== "basic" && (
            <a
              className="btn-primary w-full flex items-center justify-center text-center text-sm mt-3"
              href={upgradeUrl(shop, email, false, "basic")}
              target="_blank"
              rel="noopener noreferrer"
            >
              ⭐ Upgrade to Basic
            </a>
          )}
          {tier === "basic" && (
            <a
              className="btn-ghost w-full flex items-center justify-center text-center text-sm mt-3"
              href={upgradeUrl(shop, email, true, "basic")}
              target="_blank"
              rel="noopener noreferrer"
            >
              🔄 Renew on WhatsApp
            </a>
          )}
        </div>

        {/* Pro card */}
        <div className={`rounded-xl border-2 p-3 ${tier === "pro" ? "border-purple-500 bg-purple-50/40" : "border-masala-brown/10"}`}>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[11px] font-bold bg-masala-brown text-white rounded-full px-2 py-0.5">PRO</span>
            {tier === "pro" && <span className="text-[10px] bg-purple-600 text-white rounded-full px-1.5 py-0.5 font-bold ml-auto">Current</span>}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold">₹{PRO_PLAN.monthlyPrice}+</span>
            <span className="text-xs text-masala-brown/50">/month</span>
          </div>
          <p className="text-[11px] text-masala-brown/50">Custom per shop</p>
          {!compact && (
            <ul className="text-xs text-masala-brown/60 mt-2 space-y-1">
              <li>• Unlimited entries</li>
              <li>• No ads</li>
              <li>• Extra logins (accountant, manager)</li>
              <li>• Custom features</li>
            </ul>
          )}
          {tier !== "pro" && (
            <a
              className="btn-ghost w-full flex items-center justify-center text-center text-sm mt-3"
              href={upgradeUrl(shop, email, false, "pro")}
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 Contact for Pro
            </a>
          )}
        </div>
      </div>

      <p className="text-[11px] text-masala-brown/40 mt-3 text-center">
        Opens WhatsApp with a ready message. We activate your plan after payment.
      </p>

      {/* Pro feature label for non-Pro users */}
      {tier !== "pro" && !compact && (
        <div className="mt-3 pt-3 border-t border-dashed border-masala-brown/15 text-center">
          <span className="text-xs text-masala-brown/50 inline-flex items-center gap-1">
            <span className="bg-masala-brown/10 text-masala-brown/60 text-[10px] font-bold px-1.5 py-0.5 rounded">Pro feature</span>
            Extra logins for your accountant, manager or partner.{" "}
            <a
              href={upgradeUrl(shop, email, false, "pro")}
              target="_blank"
              rel="noopener noreferrer"
              className="underline whitespace-nowrap"
            >
              Contact us on WhatsApp ↗
            </a>
          </span>
        </div>
      )}
    </div>
  );
}
