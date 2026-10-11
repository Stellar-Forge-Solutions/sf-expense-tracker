"use client";
import { useEffect, useState } from "react";
import "./login-showcase.css";

// Animated list of what the Expense Tracker really does. Every line matches a screen in the app.
const SLIDES = [
  { k: "overview", h: "Your shop at a glance", p: "This month's sales, purchases and expenses, plus FY net, on one screen." },
  { k: "quick", h: "Add in seconds", p: "Quick Add a sale, an expense or a lending entry from any screen." },
  { k: "sales", h: "Sales & expenses", p: "Filter by month, year or financial year. Edit or delete anytime." },
  { k: "attendance", h: "Staff attendance", p: "Tap a day to mark present or absent, with a monthly summary." },
  { k: "udhari", h: "Udhari, tracked", p: "Lend, settle and send WhatsApp reminders in one tap." },
  { k: "vendors", h: "Vendor accounts", p: "See who owes you and who you owe, bill by bill." },
  { k: "pl", h: "Profit & Loss", p: "Net = Sales − Purchase − Expense, by month, year and FY." },
  { k: "sync", h: "Billing sales, automatic", p: "Connect Stellar Forge Billing once and printed bills become sales." },
];

function Visual({ k }: { k: string }) {
  const d = (n: number) => ({ "--d": `${n}s` } as React.CSSProperties);
  if (k === "overview") return (
    <div className="sfx-kpis">{[["Sales", "₹84,300"], ["Purchases", "₹41,200"], ["FY Net", "₹98,200"]].map(([l, v], i) => (
      <div key={l} className="sfx-kpi" style={d(i * 0.4)}><small>{l}</small><b>{v}</b></div>))}</div>);
  if (k === "quick") return (
    <div className="sfx-qa"><div className="sfx-plus">+</div>
      <div className="sfx-chips">{["Sale", "Expense", "Lending"].map((c, i) => <div key={c} className="sfx-chip" style={d(i * 1)}>{c}</div>)}</div></div>);
  if (k === "sales") return (
    <div className="sfx-ranges">{["Month", "Year", "Financial Year", "All"].map((c, i) => <div key={c} className="sfx-chip" style={d(i * 0.75)}>{c}</div>)}</div>);
  if (k === "attendance") return (
    <div className="sfx-days">{Array.from({ length: 10 }, (_, i) => <div key={i} className={`sfx-day${i === 5 ? " flip" : ""}`}>{i + 1}</div>)}</div>);
  if (k === "udhari") return (
    <div className="sfx-ud"><div className="sfx-av">R</div><div style={{ textAlign: "left", fontSize: ".78rem" }}><b>Ravi Kumar</b><div style={{ color: "#FF8A98", fontWeight: 700 }}>₹2,000 due</div></div>
      <div className="sfx-wa"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg></div></div>);
  if (k === "vendors") return (
    <div className="sfx-bars"><div>Owed to you<div className="sfx-bar" style={{ background: "#FFD447", width: "85%" }} /></div><div>You owe<div className="sfx-bar" style={{ background: "#E8283F", width: "55%", animationDelay: ".3s" }} /></div></div>);
  if (k === "pl") return (
    <div className="sfx-pl">{[["October 2026", "₹29,600"], ["September 2026", "₹39,900"], ["August 2026", "₹12,100"]].map(([m, v], i) => <div key={m} style={d(i * 0.25)}><span>{m}</span><b>▲{v}</b></div>)}</div>);
  return <div className="sfx-sync"><div>Billing</div><span className="sfx-line" /><div>Expenses</div></div>;
}

export default function LoginShowcase() {
  const [i, setI] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setReduced(!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches); }, []);
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 3600);
    return () => clearInterval(t);
  }, [reduced]);

  if (reduced) return <ul className="sfx-static">{SLIDES.map((s) => <li key={s.k}><b>{s.h}</b><span>{s.p}</span></li>)}</ul>;

  const s = SLIDES[i];
  return (
    <div className="sfx-show" aria-live="polite">
      <div key={"v" + i} className="sfx-vis"><Visual k={s.k} /></div>
      <h2 key={"h" + i} className="sfx-h">{s.h.split(" ").map((w, n) => <span key={n} className="sfx-word" style={{ "--i": n } as React.CSSProperties}>{w}</span>)}</h2>
      <p key={"p" + i} className="sfx-p">{s.p}</p>
      <div className="sfx-dots">{SLIDES.map((_, n) => <button key={n} aria-label={`Show feature ${n + 1}`} className={n === i ? "on" : ""} onClick={() => setI(n)} />)}</div>
    </div>
  );
}
