// ============================================================
// STELLAR FORGE EXPENSE TRACKER — CENTRAL PLAN CONFIGURATION
// ============================================================
// Change prices, limits, WhatsApp number, and ad slot IDs here ONLY.
// Do NOT hardcode any of these values elsewhere in the app.

export const UPGRADE_WHATSAPP = "919270243271";
export const PRODUCT = "Expense Tracker";

// AdSense publisher ID and slot IDs — only used by AdBanner component.
export const ADSENSE_PUBLISHER_ID = "ca-pub-4980923603937746";
export const AD_SLOTS = {
  dashboard_home: "3069231988",   // Below summary cards on /dashboard
  history_list:   "6169293180",   // Below transaction list on /sales and /expenses
};

// ── Plan limits ─────────────────────────────────────────────
export const FREE_PLAN = {
  id: "free",
  name: "Free",
  monthlyPrice: 0,
  yearlyPrice: 0,
  monthlyEntryLimit: 100,        // Manual entries per calendar month
  overageRatePerEntry: 0.10,     // ₹ per extra entry
  defaultOverageLimit: 50,       // ₹ default monthly overage cap (0 = block)
  showAds: true,
  extraLogins: false,
  features: [
    "100 entries per month (₹0.10 per extra entry)",
    "Daily sales, purchases and expenses",
    "Udhari ledger with WhatsApp reminders",
    "Vendor dues (sale & purchase)",
    "Staff attendance",
    "Monthly and FY Profit & Loss",
    "Billing auto-sync",
    "Ad-supported",
  ],
};

export const BASIC_PLAN = {
  id: "basic",
  name: "Basic",
  monthlyPrice: 29,
  yearlyPrice: 249,
  monthlyEntryLimit: 400,        // Manual entries per calendar month
  overageRatePerEntry: 0.10,     // ₹ per extra entry
  defaultOverageLimit: 50,
  showAds: false,
  extraLogins: false,
  features: [
    "400 entries per month (₹0.10 per extra entry)",
    "No ads",
    "Everything in Free",
  ],
};

export const PRO_PLAN = {
  id: "pro",
  name: "Pro",
  monthlyPrice: 199,             // Starting from — actual price set by admin
  yearlyPrice: null,             // Custom per shop
  monthlyEntryLimit: Infinity,   // Unlimited
  overageRatePerEntry: 0,
  defaultOverageLimit: 0,
  showAds: false,
  extraLogins: true,
  features: [
    "Unlimited entries",
    "No ads",
    "Extra logins (accountant, manager, partner with roles)",
    "Custom features built to your requirements",
    "Priority WhatsApp support",
    "Everything in Basic",
  ],
};

// Plan lookup by ID
export const PLANS = { free: FREE_PLAN, basic: BASIC_PLAN, pro: PRO_PLAN };

// ── Helpers ─────────────────────────────────────────────────

export function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Derive a shop's current plan from an entitlement row.
 * Supports legacy `paid_until` / `trial_ends_at` fields for existing users.
 *
 * @param {object|null} ent — row from entitlements (or null if no entitlement yet)
 * @returns {{ tier: 'free'|'basic'|'pro', plan: object, isLegacyPaid: boolean, renewalDate: string|null }}
 */
export function getPlan(ent) {
  const now = Date.now();

  // Pro: explicit tier
  if (ent?.plan_tier === "pro") {
    return {
      tier: "pro",
      plan: PRO_PLAN,
      isLegacyPaid: false,
      renewalDate: ent.plan_renewal_date || ent.paid_until || null,
    };
  }

  // Basic: explicit tier OR legacy paid_until still active
  if (
    ent?.plan_tier === "basic" ||
    (ent?.paid_until && new Date(ent.paid_until).getTime() > now)
  ) {
    return {
      tier: "basic",
      plan: BASIC_PLAN,
      isLegacyPaid: !ent.plan_tier || ent.plan_tier !== "basic",
      renewalDate: ent.plan_renewal_date || ent.paid_until || null,
    };
  }

  // Free (default)
  return {
    tier: "free",
    plan: FREE_PLAN,
    isLegacyPaid: false,
    renewalDate: null,
  };
}

/**
 * Check whether a feature is available on the given plan tier.
 * @param {'free'|'basic'|'pro'} tier
 * @param {'ads'|'extraLogins'|'unlimitedEntries'} feature
 */
export function can(tier, feature) {
  const plan = PLANS[tier] || FREE_PLAN;
  switch (feature) {
    case "ads":           return plan.showAds;
    case "extraLogins":   return plan.extraLogins;
    case "unlimitedEntries": return plan.monthlyEntryLimit === Infinity;
    default:              return true; // unknown features not gated
  }
}

/**
 * Returns what fraction of the monthly limit is used (0–1+).
 * Returns 0 for Pro (unlimited).
 */
export function usageFraction(tier, used) {
  const plan = PLANS[tier] || FREE_PLAN;
  if (plan.monthlyEntryLimit === Infinity) return 0;
  return used / plan.monthlyEntryLimit;
}

/**
 * Creates the WhatsApp upgrade / renewal URL.
 * email intentionally accepts any value here because this is a
 * JavaScript module consumed by TypeScript components.
 */
export function upgradeUrl(shop, email = null, renew = false, plan = "basic") {
  const first =
    plan === "pro"
      ? `Hello Stellar Forge, I want to know more about / upgrade to the Pro plan for the ${PRODUCT}.`
      : renew
        ? `Hello Stellar Forge, I want to renew my Basic plan for the ${PRODUCT} (₹${BASIC_PLAN.monthlyPrice}/month or ₹${BASIC_PLAN.yearlyPrice}/year).`
        : `Hello Stellar Forge, I want to upgrade to Basic plan for the ${PRODUCT} (₹${BASIC_PLAN.monthlyPrice}/month or ₹${BASIC_PLAN.yearlyPrice}/year, no ads, 400 entries/month).`;

  const lines = [
    first,
    "",
    `Shop: ${shop?.name || "-"}`,
    `Mobile: ${shop?.mobile || "-"}`,
    `Email: ${email || "-"}`,
    "",
    "Please share the payment details and activate my account.",
  ];

  return `https://wa.me/${UPGRADE_WHATSAPP}?text=${encodeURIComponent(
    lines.join("\n")
  )}`;
}

/**
 * Creates the WhatsApp message for Basic plan upgrade pre-filled with overage notice.
 */
export function overageUpgradeUrl(shop, email = null) {
  const lines = [
    `Hello Stellar Forge, I've reached my Free plan entry limit on the ${PRODUCT}.`,
    `I'd like to upgrade to Basic (₹${BASIC_PLAN.monthlyPrice}/month — no ads, 400 entries/month).`,
    "",
    `Shop: ${shop?.name || "-"}`,
    `Mobile: ${shop?.mobile || "-"}`,
    `Email: ${email || "-"}`,
  ];

  return `https://wa.me/${UPGRADE_WHATSAPP}?text=${encodeURIComponent(
    lines.join("\n")
  )}`;
}

// Legacy export for backward compat with any code that imports planState
export function planState(ent) {
  const now = Date.now();

  if (ent?.paid_until && new Date(ent.paid_until).getTime() > now) {
    return {
      kind: "paid",
      until: ent.paid_until,
      days: Math.ceil((new Date(ent.paid_until).getTime() - now) / 864e5),
    };
  }

  if (ent?.trial_ends_at && new Date(ent.trial_ends_at).getTime() > now) {
    return {
      kind: "trial",
      until: ent.trial_ends_at,
      days: Math.ceil((new Date(ent.trial_ends_at).getTime() - now) / 864e5),
    };
  }

  return {
    kind: "ended",
    until: ent?.paid_until || ent?.trial_ends_at || null,
    days: 0,
  };
}
