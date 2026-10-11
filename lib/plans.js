// Plan details and the "Upgrade" WhatsApp link for the Expense Tracker.
// Change prices / the WhatsApp number here only. (Same plans as Stellar Forge Billing.)

export const UPGRADE_WHATSAPP = "919270243271";
export const PRODUCT = "Expense Tracker";

export const BASIC_PLAN = {
  name: "Basic",
  monthly: 99,
  yearly: 799,
  features: [
    "Sales, purchases and expenses with month, year and financial-year views",
    "Profit & Loss, staff attendance and vendor accounts",
    "Udhari (lending) with WhatsApp reminders",
    "Quick Add and automatic Billing sales",
  ],
};

export const PRO_PLAN = {
  name: "Pro",
  monthly: 199,
  yearly: 1599,
  features: [
    "Everything in Basic",
    "Staff logins in Stellar Forge Billing: staff can bill but cannot see your sales totals, earnings or reports",
    "Sales by staff and who created each bill (in Billing)",
    "Priority WhatsApp support",
  ],
};

export function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

// Where is this shop in its Expense Tracker plan?
// paid | trial | ended
export function planState(ent) {
  const now = Date.now();

  if (ent?.paid_until && new Date(ent.paid_until).getTime() > now) {
    return {
      kind: "paid",
      until: ent.paid_until,
      days: Math.ceil(
        (new Date(ent.paid_until).getTime() - now) / 864e5
      ),
    };
  }

  if (
    ent?.trial_ends_at &&
    new Date(ent.trial_ends_at).getTime() > now
  ) {
    return {
      kind: "trial",
      until: ent.trial_ends_at,
      days: Math.ceil(
        (new Date(ent.trial_ends_at).getTime() - now) / 864e5
      ),
    };
  }

  return {
    kind: "ended",
    until: ent?.paid_until || ent?.trial_ends_at || null,
    days: 0,
  };
}

// Opens WhatsApp with a ready message asking for the monthly Basic subscription
// or, with plan = "pro", asking about the Pro plan.
export function upgradeUrl(
  shop,
  email = null,
  renew = false,
  plan = "basic"
) {
  const first =
    plan === "pro"
      ? `Hello Stellar Forge, I want to know more about / upgrade to the Pro plan (Rs. ${PRO_PLAN.monthly}/month) for the ${PRODUCT}.`
      : renew
        ? `Hello Stellar Forge, I want to renew my Basic plan for the ${PRODUCT} (monthly subscription).`
        : `Hello Stellar Forge, I want to upgrade to the Basic plan for the ${PRODUCT} (monthly subscription, Rs. ${BASIC_PLAN.monthly}/month).`;

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
