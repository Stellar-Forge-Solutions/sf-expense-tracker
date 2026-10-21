"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DataTable from "@/components/DataTable";
import { inr } from "@/lib/finance";
import { X } from "lucide-react";
import { useShop } from "@/lib/shop";
import { overageUpgradeUrl } from "@/lib/plans";
import AdBanner from "@/components/AdBanner";

type Txn = "sale" | "purchase" | "expense";

type Row = {
  id?: number;
  txn_date: string;
  type: string;
  amount: number;
  category: string | null;
  description: string | null;
  source: string;
};

export default function TxnPage({ type, title }: { type: Txn; title: string }) {
  const supabase = createClient();
  const { shop, planResult, usage, reload: reloadShop } = useShop();
  const [rows, setRows] = useState<Row[]>([]);
  const [range, setRange] = useState<"month" | "year" | "fy" | "all">("month");
  const [form, setForm] = useState({ amount: "", category: "", txn_date: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  // Additional filters
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  // Overage
  const [overageAcknowledged, setOverageAcknowledged] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const { tier, plan } = planResult;
  const used = usage.monthlyEntries;
  const limit = plan.monthlyEntryLimit;
  const isOverLimit = tier !== "pro" && used >= limit;
  const requiresOverageNotice = isOverLimit && !overageAcknowledged && !editingId;

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });
  }, []);

  function rangeStart() {
    const now = new Date();
    if (range === "month") return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    if (range === "year") return new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
    if (range === "fy") {
      const y = now.getMonth() + 1 >= 4 ? now.getFullYear() : now.getFullYear() - 1;
      return `${y}-04-01`;
    }
    return null;
  }

  async function load() {
    let q = supabase.from("transactions").select("*").eq("type", type).order("txn_date", { ascending: false });
    const start = rangeStart();
    if (start) q = q.gte("txn_date", start);
    const { data } = await q;
    setRows(data || []);
    setTotal((data || []).reduce((s, r) => s + Number(r.amount), 0));
  }

  useEffect(() => { load(); }, [range]);

  function resetForm() {
    setForm({ amount: "", category: "", txn_date: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
    setOverageAcknowledged(false);
  }

  function startEdit(row: Row) {
    setForm({
      amount: String(row.amount),
      category: row.category || "",
      txn_date: row.txn_date,
    });
    setEditingId(row.id ?? null);
    // Editing doesn't count toward limit — no overage notice needed
    setOverageAcknowledged(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      type,
      amount: Number(form.amount),
      category: form.category || null,
      txn_date: form.txn_date,
      source: "web",
      created_by: user?.id,
    };

    if (editingId) {
      await supabase.from("transactions").update(payload).eq("id", editingId);
    } else {
      await supabase.from("transactions").insert(payload);
    }

    resetForm();
    setSaving(false);
    load();
    // Refresh usage counter after a new insert
    if (!editingId) reloadShop();
  }

  async function handleDelete(row: Row) {
    if (!confirm(`Delete this ${type} of ${inr(row.amount)}?`)) return;
    await supabase.from("transactions").delete().eq("id", row.id);
    load();
    reloadShop();
  }

  const showAds = tier === "free";
  const dataLoaded = rows.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold capitalize">{title}</h1>
        <div className="flex gap-2 flex-wrap">
          {(["month", "year", "fy", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                range === r ? "bg-masala-red text-white border-masala-red" : "border-masala-brown/20 text-masala-brown/70"
              }`}
            >
              {r === "fy" ? "Financial Year" : r[0].toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar — Month dropdown + Date range */}
      <div className="card p-3 md:p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="field-label">Month</label>
            <select
              className="input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              {Array.from({ length: 12 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
                return <option key={ym} value={ym}>{label}</option>;
              })}
            </select>
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="field-label">From Date</label>
            <input
              className="input"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="field-label">To Date</label>
            <input
              className="input"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          {(selectedMonth !== "all" || dateFrom || dateTo) && (
            <button
              onClick={() => { setSelectedMonth("all"); setDateFrom(""); setDateTo(""); }}
              className="btn-ghost text-xs h-[42px]"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="card p-4 md:p-5 space-y-3 md:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingId ? "Edit" : "Add"} {title.slice(0, -1)}</h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-masala-brown/50 hover:text-masala-red p-1">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Over-limit notice shown BEFORE the user fills the form (only for new entries) */}
          {requiresOverageNotice && (
            <div className="p-3 bg-masala-red/5 border border-masala-red/20 rounded-lg text-xs">
              <p className="font-semibold text-masala-red mb-1">
                You&apos;ve used all {limit} included entries this month.
              </p>
              <p className="text-masala-brown/70 mb-2">
                Extra entries cost ₹{plan.overageRatePerEntry} each.
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setOverageAcknowledged(true)}
                  className="px-3 py-1.5 rounded-lg border border-masala-brown/20 text-masala-brown/70 text-xs hover:bg-masala-brown/5"
                >
                  Continue anyway
                </button>
                {tier === "free" && (
                  <a
                    href={overageUpgradeUrl(shop, email)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-masala-red text-white text-xs font-semibold"
                  >
                    ⭐ Upgrade to Basic (₹29/month)
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Form fields — always visible so a half-filled form is never lost */}
          <div className={requiresOverageNotice ? "opacity-50 pointer-events-none" : ""}>
            <div>
              <label className="text-sm font-medium">Amount (₹)</label>
              <input className="input mt-1" type="number" required min="0" step="0.01"
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <input className="input mt-1" type="date" required
                value={form.txn_date} onChange={(e) => setForm({ ...form, txn_date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <input className="input mt-1" placeholder="e.g. Garam Masala, Rent..."
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>

          <button className="btn-primary w-full" disabled={saving || requiresOverageNotice}>
            {saving ? "Saving..." : editingId ? `Update ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
          </button>
        </form>

        <div className="md:col-span-2 space-y-4">
          <div className="kpi-card">
            <p className="text-xs uppercase tracking-wide text-masala-gold/90 font-semibold">
              Total ({range === "fy" ? "Financial Year" : range})
            </p>
            <p className="text-3xl font-bold mt-1">{inr(total)}</p>
          </div>
          <DataTable
            rows={rows}
            title={`${title} — ${rows.length} entries`}
            onEdit={startEdit}
            onDelete={handleDelete}
          />

          {/* Ad banner — Free plan only, below list, not while loading/empty */}
          {showAds && dataLoaded && (
            <AdBanner slot="history_list" showAds={showAds} />
          )}
        </div>
      </div>
    </div>
  );
}
