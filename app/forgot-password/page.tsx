"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to send reset link. Please try again.");
      } else {
        setSent(true);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-masala-gradient flex items-center justify-center shadow-glow-red">
            <img src="/sf-mark-light.png" alt="" className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Reset Password</h1>
            <p className="text-xs text-masala-brown/60">Stellar Forge Expense Tracker</p>
          </div>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 text-sm">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <CheckCircle2 size={18} className="text-green-600" />
                Check your email
              </div>
              <p className="text-xs text-green-800 leading-relaxed">
                We sent a password reset link to <b>{email}</b>. Please check your inbox and spam folder.
              </p>
            </div>
            <Link
              href="/login"
              className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft size={16} /> Back to Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-masala-brown/70 leading-relaxed">
              Enter the email address registered with your shop. We will send you a secure link to reset your password.
            </p>

            <div>
              <label className="text-sm font-medium">Email address</label>
              <input
                className="input mt-1"
                type="email"
                required
                autoFocus
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && <p className="text-masala-red text-xs">{error}</p>}

            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Sending link…" : "Send Reset Link"}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs text-masala-brown/60 hover:text-masala-brown inline-flex items-center gap-1.5 underline"
              >
                <ArrowLeft size={14} /> Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>

      <p className="text-[11px] text-masala-brown/40 mt-4">Powered by Stellar Forge</p>
    </div>
  );
}
