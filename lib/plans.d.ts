export const UPGRADE_WHATSAPP: string;
export const PRODUCT: string;

export const BASIC_PLAN: {
  name: string;
  monthly: number;
  yearly: number;
  features: string[];
};

export const PRO_PLAN: {
  name: string;
  monthly: number;
  yearly: number;
  features: string[];
};

export function fmtDate(d: string): string;

export function planState(
  ent:
    | {
        trial_ends_at: string | null;
        paid_until: string | null;
      }
    | null
    | undefined
): {
  kind: "paid" | "trial" | "ended";
  until: string | null;
  days: number;
};

export function upgradeUrl(
  shop: any,
  email?: string | null,
  renew?: boolean,
  plan?: "basic" | "pro"
): string;
