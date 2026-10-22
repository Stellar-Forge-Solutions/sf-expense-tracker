"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Supabase client auto-parses recovery tokens from hash fragment (#access_token=...&type=recovery)
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      }
      setCheckingSession(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [supabase]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      return setError("Password must be at least 8 characters long.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || "Failed to update password. Your reset link may have expired.");
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.replace("/dashboard");
      }, 2000);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-masala-gradient flex items-center justify-center shadow-glow-red">
            <Lock size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Create New Password</h1>
            <p className="text-xs text-masala-brown/60">Stellar Forge Expense Tracker</p>
          </div>
        </div>

        {checkingSession ? (
          <div className="text-center py-6">
            <p className="text-xs text-masala-brown/50">Verifying security token…</p>
          </div>
        ) : success ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 text-sm">
              <CheckCircle2 size={24} className="text-green-600 mx-auto mb-2" />
              <p className="font-semibold">Password updated successfully!</p>
              <p className="text-xs text-green-800 mt-1">Redirecting you to dashboard…</p>
            </div>
            <Link href="/dashboard" className="btn-primary w-full inline-block text-sm">
              Go to Dashboard
            </Link>
          </div>
        ) : !sessionReady ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-masala-red/10 border border-masala-red/20 text-masala-red text-xs leading-relaxed">
              <p className="font-semibold text-sm mb-1">Invalid or expired link</p>
              This password reset link is invalid or has expired. Please request a new link.
            </div>
            <Link
              href="/forgot-password"
              className="btn-primary w-full inline-flex items-center justify-center text-sm"
            >
              Request new link
            </Link>
            <div className="text-center">
              <Link href="/login" className="text-xs text-masala-brown/60 underline">
                Back to Sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Password</label>
              <input
                className="input mt-1"
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium">Confirm New Password</label>
              <input
                className="input mt-1"
                type="password"
                required
                minLength={8}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-masala-red text-xs">{error}</p>}

            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Updating password…" : "Update Password"}
            </button>
          </form>
        )}
      </div>

      <p className="text-[11px] text-masala-brown/40 mt-4">Powered by Stellar Forge</p>
    </div>
  );
}
