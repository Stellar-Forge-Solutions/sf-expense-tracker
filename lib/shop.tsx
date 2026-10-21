"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { setBusinessName } from "@/lib/whatsapp";
import { getPlan, FREE_PLAN, BASIC_PLAN } from "@/lib/plans";
import type { PlanResult, Entitlement } from "@/lib/plans";

export type Ent = Entitlement & { product: string };

export interface UsageState {
  monthlyEntries: number;    // entries created this calendar month (excl. billing-synced)
  loading: boolean;
}

type State = {
  loading: boolean;
  hasSession: boolean;
  shop: any | null;
  ents: Ent[];
  canWrite: boolean;
  planResult: PlanResult;
  usage: UsageState;
};

const defaultPlan: PlanResult = {
  tier: "free",
  plan: FREE_PLAN,
  isLegacyPaid: false,
  renewalDate: null,
};

const empty: State = {
  loading: true,
  hasSession: false,
  shop: null,
  ents: [],
  canWrite: false,
  planResult: defaultPlan,
  usage: { monthlyEntries: 0, loading: true },
};

const Ctx = createContext<State & { reload: () => Promise<void> }>({ ...empty, reload: async () => {} });
export const useShop = () => useContext(Ctx);

/** Returns the current calendar month bounds in IST (YYYY-MM-DD strings) */
function istMonthBounds() {
  const now = new Date();
  // Shift to IST (+5:30 = 330 min)
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

export function ShopProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(empty);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return setS({ loading: false, hasSession: false, shop: null, ents: [], canWrite: false, planResult: defaultPlan, usage: { monthlyEntries: 0, loading: false } });
    }

    const [{ data: shop }, { data: ents }] = await Promise.all([
      supabase.from("shops").select("*").maybeSingle(),
      supabase.from("entitlements").select("*"),
    ]);

    const ex = (ents || []).find((e: any) => e.product === "expenses");
    const planResult = getPlan(ex);

    // canWrite: approved shop on any plan can write (free plan has limits but not a hard lock)
    // Exception: if they have no entitlement at all yet, they need to activate first
    const canWrite = !!shop && shop.status === "approved" && !!ex;

    if (shop?.name) setBusinessName(shop.name);

    // Load monthly usage in parallel
    const { start, end } = istMonthBounds();
    const [{ count: txnCount }, { count: lendCount }] = await Promise.all([
      supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .neq("source", "billing")
        .gte("txn_date", start)
        .lte("txn_date", end),
      supabase
        .from("lending")
        .select("id", { count: "exact", head: true })
        .eq("type", "lend")
        .gte("date", start)
        .lte("date", end),
    ]);

    const monthlyEntries = (txnCount || 0) + (lendCount || 0);

    setS({
      loading: false,
      hasSession: true,
      shop,
      ents: (ents as Ent[]) || [],
      canWrite,
      planResult,
      usage: { monthlyEntries, loading: false },
    });
  }, []);

  useEffect(() => {
    load();
    const { data: sub } = createClient().auth.onAuthStateChange(() => { load(); });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  return <Ctx.Provider value={{ ...s, reload: load }}>{children}</Ctx.Provider>;
}
