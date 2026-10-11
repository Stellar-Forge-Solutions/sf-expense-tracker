"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { setBusinessName } from "@/lib/whatsapp";

export type Ent = { product: string; trial_ends_at: string | null; paid_until: string | null };
type State = { loading: boolean; hasSession: boolean; shop: any | null; ents: Ent[]; canWrite: boolean };
const empty: State = { loading: true, hasSession: false, shop: null, ents: [], canWrite: false };
const Ctx = createContext<State & { reload: () => Promise<void> }>({ ...empty, reload: async () => {} });
export const useShop = () => useContext(Ctx);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(empty);
  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return setS({ loading: false, hasSession: false, shop: null, ents: [], canWrite: false });
    const { data: shop } = await supabase.from("shops").select("*").maybeSingle();
    const { data: ents } = await supabase.from("entitlements").select("*");
    const ex = (ents || []).find((e: any) => e.product === "expenses");
    const now = Date.now();
    const active = !!ex && ((ex.trial_ends_at && new Date(ex.trial_ends_at).getTime() > now) || (ex.paid_until && new Date(ex.paid_until).getTime() > now));
    if (shop?.name) setBusinessName(shop.name);
    setS({ loading: false, hasSession: true, shop, ents: (ents as Ent[]) || [], canWrite: !!shop && shop.status === "approved" && !!active });
  }, []);
  useEffect(() => {
    load();
    const { data: sub } = createClient().auth.onAuthStateChange(() => { load(); });
    return () => sub.subscription.unsubscribe();
  }, [load]);
  return <Ctx.Provider value={{ ...s, reload: load }}>{children}</Ctx.Provider>;
}
