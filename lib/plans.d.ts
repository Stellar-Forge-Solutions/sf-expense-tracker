// TypeScript type declarations for lib/plans.js

export declare const UPGRADE_WHATSAPP: string;
export declare const PRODUCT: string;
export declare const ADSENSE_PUBLISHER_ID: string;
export declare const AD_SLOTS: {
  dashboard_home: string;
  history_list: string;
};

export interface PlanDef {
  id: "free" | "basic" | "pro";
  name: string;
  monthlyPrice: number;
  yearlyPrice: number | null;
  monthlyEntryLimit: number; // Infinity for Pro
  overageRatePerEntry: number;
  defaultOverageLimit: number;
  showAds: boolean;
  extraLogins: boolean;
  features: string[];
}

export declare const FREE_PLAN: PlanDef;
export declare const BASIC_PLAN: PlanDef;
export declare const PRO_PLAN: PlanDef;
export declare const PLANS: Record<"free" | "basic" | "pro", PlanDef>;

export interface Entitlement {
  product: string;
  trial_ends_at: string | null;
  paid_until: string | null;
  plan_tier?: "free" | "basic" | "pro" | null;
  plan_start?: string | null;
  plan_renewal_date?: string | null;
}

export interface PlanResult {
  tier: "free" | "basic" | "pro";
  plan: PlanDef;
  isLegacyPaid: boolean;
  renewalDate: string | null;
}

export declare function getPlan(ent: Entitlement | null | undefined): PlanResult;
export declare function can(tier: "free" | "basic" | "pro", feature: "ads" | "extraLogins" | "unlimitedEntries" | string): boolean;
export declare function usageFraction(tier: "free" | "basic" | "pro", used: number): number;
export declare function fmtDate(d: string): string;

export declare function upgradeUrl(
  shop: { name?: string; mobile?: string } | null | undefined,
  email?: string | null,
  renew?: boolean,
  plan?: "basic" | "pro"
): string;

export declare function overageUpgradeUrl(
  shop: { name?: string; mobile?: string } | null | undefined,
  email?: string | null
): string;

// Legacy
export interface PlanStateResult {
  kind: "paid" | "trial" | "ended";
  until: string | null;
  days: number;
}
export declare function planState(ent: Entitlement | null | undefined): PlanStateResult;
