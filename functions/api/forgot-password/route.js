import { createClient } from "@supabase/supabase-js";
import { sendMail } from "../../_lib/gmail.js";
import { json } from "../../_lib/http.js";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return new Response(null, { status: 405 });

  const b = (await request.json().catch(() => ({}))) || {};
  const email = String(b.email || "").trim().toLowerCase();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: "Enter a valid email address" }, 400);
  }

  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const reqUrl = new URL(request.url);
    const origin = reqUrl.origin;
    const redirectTo = `${origin}/reset-password`;

    // Generate password recovery link using Supabase Admin API
    const { data, error } = await sb.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("Supabase generateLink error:", error.message);
      // Return success anyway to prevent email enumeration attacks
      return json({ ok: true });
    }

    const actionLink = data?.properties?.action_link;
    if (!actionLink) {
      console.error("No action_link returned from generateLink");
      return json({ ok: true });
    }

    // Send reset email via existing Gmail API configuration
    await sendMail(env, {
      to: email,
      subject: "Reset your Stellar Forge Expense Tracker password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #1e130c; background-color: #fdf6e3; border-radius: 12px; border: 1px solid rgba(30,19,12,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="margin: 0; color: #b4182a; font-size: 20px;">STELLAR FORGE</h2>
            <p style="margin: 4px 0 0; font-size: 13px; color: rgba(30,19,12,0.6);">Expense Tracker</p>
          </div>
          <div style="background: #ffffff; padding: 24px; border-radius: 10px; border: 1px solid rgba(30,19,12,0.08);">
            <h3 style="margin-top: 0; color: #1e130c; font-size: 16px;">Password Reset Request</h3>
            <p style="font-size: 14px; line-height: 1.5; color: rgba(30,19,12,0.8);">
              We received a request to reset your password for your Stellar Forge Expense Tracker account (<b>${esc(email)}</b>).
            </p>
            <p style="font-size: 14px; line-height: 1.5; color: rgba(30,19,12,0.8);">
              Click the button below to choose a new password. This link is valid for 1 hour.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${actionLink}" style="display: inline-block; background: linear-gradient(135deg, #e8283f, #b4182a 45%, #7a0f1c); color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px; box-shadow: 0 4px 12px rgba(180,24,42,0.35);">
                Reset Password
              </a>
            </div>
            <p style="font-size: 12px; line-height: 1.4; color: rgba(30,19,12,0.5); margin-bottom: 0;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 11px; color: rgba(30,19,12,0.4);">
            Stellar Forge Solutions · Expense Tracker
          </div>
        </div>
      `,
    });

    return json({ ok: true });
  } catch (err) {
    console.error("Forgot password route error:", err);
    return json({ error: "Could not process password reset" }, 500);
  }
}
