"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoginShowcase from "@/components/LoginShowcase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.replace("/dashboard");
  }

  return (
    <div className="sfx-login">
      {/* Left / top: brand + animated list of what the app does */}
      <section className="sfx-hero">
        <img src="/sf-mark-light.png" alt="" style={{ width: 56 }} />
        <div className="sfx-brand">STELLAR FORGE</div>
        <div className="sfx-sub">EXPENSE TRACKER</div>
        <div className="sfx-badge">Free plan · 100 entries/month included · No card needed</div>
        <LoginShowcase />
      </section>

      {/* Right / bottom: sign up first, sign in second */}
      <section className="sfx-panel">
        <Link href="/signup" className="sfx-cta">Start free — 100 entries/month →</Link>
        <p className="sfx-note">We review every new shop within 1 hour (9 am – 9 pm IST) and message you on WhatsApp. Your free plan starts when you are approved.</p>
        <div className="sfx-or">Already have an account?</div>
        <form onSubmit={handleLogin} className="card w-full max-w-sm p-8">
          <label className="text-sm font-medium">Email</label>
          <input className="input mt-1 mb-4" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          <label className="text-sm font-medium">Password</label>
          <input className="input mt-1 mb-1" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} required />
          <div className="flex justify-end mb-4">
            <Link href="/forgot-password" className="text-xs text-masala-brown/70 hover:text-masala-red underline">
              Forgot password?
            </Link>
          </div>
          {error && <p className="text-masala-red text-sm mb-3">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-xs text-masala-brown/50 mt-5">Powered by Stellar Forge</p>
      </section>
    </div>
  );
}
