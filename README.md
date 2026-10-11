# sf-expense-tracker — Stellar Forge Expense Tracker (multi-shop)
Same screens and features as the original tracker (sales, purchases, expenses, attendance, P&L, lending, sale/purchase vendors),
now multi-shop: self-signup with admin review, its own 15-day trial, view-only after the trial, Settings, Stellar Forge branding.
Telegram has been removed. Database objects live in the **sf-admin-dash** repo (`0003_expense.sql`); this repo has no migrations.

## Deploy
1. Deploy **sf-admin-dash** first (it applies migrations 0001-0003 to Supabase).
2. Push this folder to its own GitHub repo -> Vercel -> Add New Project (Next.js is detected). Add the env vars from `.env.example`.
3. Supabase -> Authentication -> Providers -> Email: turn OFF "Allow new users to sign up" (signup goes through /api/signup).

## How accounts work
One Stellar Forge login = one shop, shared with Billing. A Billing customer signs in here with the same email and taps
"Start 15-day free trial" (their own trial for this product). Settings -> "Connect Billing sales" adds each day's printed bills as one sale.
