# Stellar Forge Expense Tracker (sf-expense-tracker)

### Simple daily accounts for small vendors: sales, purchases, expenses, udhari, staff attendance and profit, all in one phone-friendly app.

**Stellar Forge Expense Tracker** is a mobile-first web app (installable on the home screen) for small shops in India. The owner adds the day's sales, purchases and expenses in a few taps, keeps a record of **udhari** (money lent), tracks what vendors owe and what the shop owes, marks staff attendance, and sees **Profit & Loss** for the month, the year and the financial year. Reminders go out on **WhatsApp** in one tap.

It works on its own, and it also connects to **Stellar Forge Billing**: once connected, every day's printed bills are added as a sale automatically.

> **Who is this README for?**
> Developers, yes, but also **video creators, marketers, sales people and support staff**. Sections 1 to 12 explain the product in plain language so you can make demo videos, reels and training material without reading code. Technical details are at the end (sections 13 to 15).

---

## Table of contents

1. [The product in 30 seconds](#1-the-product-in-30-seconds)
2. [Who is it for](#2-who-is-it-for)
3. [The problem and our answer](#3-the-problem-and-our-answer)
4. [Full feature list](#4-full-feature-list)
5. [Screen-by-screen walkthrough](#5-screen-by-screen-walkthrough)
6. [Connecting Billing sales](#6-connecting-billing-sales)
7. [Business use cases and examples](#7-business-use-cases-and-examples)
8. [Signup, trial and account flow](#8-signup-trial-and-account-flow)
9. [Plans and pricing](#9-plans-and-pricing)
10. [Honest limits (what it does NOT do)](#10-honest-limits-what-it-does-not-do)
11. [Video and marketing kit](#11-video-and-marketing-kit)
12. [FAQ](#12-faq)
13. [Tech stack and project structure](#13-tech-stack-and-project-structure)
14. [Deploy and configuration](#14-deploy-and-configuration)
15. [Developer notes](#15-developer-notes)

---

## 1. The product in 30 seconds

| | |
|---|---|
| **What it is** | A daily accounts app for small shops: money in, money out, who owes whom, and profit. |
| **Who it is for** | Kirana, pooja stores, medical and general stores, tailors, garages, caterers, bakeries and other small vendors who keep accounts in a notebook. |
| **Main promise** | Add a sale or expense in seconds, and know your profit without a calculator. |
| **Add fast** | The **Quick Add** button takes a sale, expense or lending entry in a few taps. |
| **Udhari** | Track money lent and settled, and send a WhatsApp reminder in one tap. |
| **Profit** | Net = Sales minus Purchases minus Expenses, for the month, the year and the financial year (April to March). |
| **Billing link** | Connect Stellar Forge Billing once, and printed bills become sales automatically. |
| **Free trial** | 15 days for the Expense Tracker, starts when you tap **Start 15-day free trial**. After that: Basic plan at ₹99 per month or ₹799 per year. |
| **Needs internet?** | Yes. Data is saved online. |

**Taglines you can use**

- *Your shop's accounts, in your pocket.*
- *Sales, expenses and udhari. One app. One minute a day.*
- *Know your profit. Every day.*
- Hindi: *दुकान का हिसाब, अब मोबाइल पर।*
- Marathi: *दुकानाचा हिशोब, आता मोबाईलवर.*

---

## 2. Who is it for

| Persona | Typical day | Why they will like it |
|---|---|---|
| **Kirana / grocery owner** | Many small sales, some udhari customers. | Quick Add for sales, udhari list with WhatsApp reminders. |
| **Shop with helpers** | 1 to 5 staff, paid by attendance. | Tap a day to mark present or absent, with a monthly summary. |
| **Wholesaler / trader** | Buys from vendors, sells to vendors, bill by bill. | Vendor accounts show who owes you and whom you owe. |
| **Tailor / garage / service shop** | Fewer entries, bigger amounts, some pending payments. | Sales, expenses, udhari and profit in one place. |
| **Home business / bakery / caterer** | Sales and expenses mixed with home spending. | Simple categories and a clear monthly profit. |
| **Billing app customer** | Already prints bills with Stellar Forge Billing. | Connect once and bills flow into sales by themselves. |

Where these users are: tier 2 and 3 towns, local markets, wholesale lanes. Many prefer Hindi or Marathi, and they watch YouTube Shorts, Instagram Reels and WhatsApp forwards. Short vertical videos in simple language work best.

---

## 3. The problem and our answer

| Problem a small vendor faces | How the Expense Tracker helps |
|---|---|
| Accounts in a notebook, hard to total at month end. | Every entry is saved, with totals by month, year and financial year. |
| "Did I make a profit this month?" | The **Overview** and **Profit & Loss** pages answer this. |
| Customers forget udhari. | Udhari list with the remaining amount, and a one-tap WhatsApp reminder. |
| Vendors' pending payments get mixed up. | Sale vendors and purchase vendors with amount, paid and remaining, bill by bill. |
| Helper attendance is on paper. | Tap-to-mark attendance with a monthly present and absent summary. |
| Double entry: bills in one place, accounts in another. | Connect Billing sales so printed bills become sales automatically. |
| Wrong entry. | Edit or delete any entry later. |

---

## 4. Full feature list

### 4.1 Overview (home screen)
- This month's **Sales**, **Purchases** and **Expenses**, and the **financial-year Net**, as four cards.
- A **monthly trend chart** and a table of **recent transactions**.
- **Quick Add** button at the top.
- A **plan card** with your trial or plan status and the upgrade button.

### 4.2 Quick Add
- Add a **Sale**, an **Expense** or a **Lending** entry in a few taps: amount, category (or person name), and it is saved with today's date.

### 4.3 Sales and Expenses
- Add entries with amount, category, date and description.
- **Filters:** this month, this year, this financial year, or all; plus month and date-range filters.
- **Total** for the selected period.
- **Edit and delete** any entry.
- Entries added by the Billing connection are marked with their source.

### 4.4 Udhari (Lending)
- Record **lend** and **settle** entries per person, with an optional WhatsApp number.
- Per-person view: **total lent, total settled and remaining**, with "Settled ✓" when clear.
- **WhatsApp message** after an entry, and a **follow-up reminder** button for anyone with money remaining.
- Messages are written in **Marathi**, with the shop name, the amount and the person's current balance.

### 4.5 Sale Vendors (customers who buy from you on account)
- Entries with vendor name, amount, amount paid, optional **bill number**, date and WhatsApp number.
- Vendor-wise summary of **total, paid and remaining**, highest balance first.
- Month filters and KPI cards.
- WhatsApp entry message and follow-up reminder (Marathi).

### 4.6 Purchase Vendors (whom you buy from)
- Entries with vendor, amount, **paid** amount and date.
- Vendor-wise **total, paid and balance**.
- Purchase totals feed into Profit & Loss.
- This section is your own record. It does not send WhatsApp messages to vendors.

### 4.7 Attendance
- Add your staff by name.
- Tap a day to mark **present or absent**.
- **Monthly summary table** with present and absent counts for everyone.
- Note: this is attendance for your employees. It is not a login for staff.

### 4.8 Profit & Loss
- **Net = Sales − Purchase − Expense.**
- Cards for this month's sales, purchase plus expense, net, and the financial-year net.
- Tables by **month, year and financial year**.

### 4.9 Settings
- Plan card at the top: status, price, upgrade and Pro enquiry buttons.
- **Shop details:** shop name, mobile and WhatsApp number.
- **Connect Billing sales** switch (see section 6).

### 4.10 Works like an app
- Add to Home Screen (PWA), full-screen, mobile bottom bar with the 4 most-used pages and a **More** menu, desktop sidebar.
- Large touch buttons, no double-tap zoom, inputs sized to avoid iPhone zoom.

---

## 5. Screen-by-screen walkthrough

Use this as your shot list.

1. **Sign in and signup.** A dark sign-in with an animated benefits showcase: *Your shop at a glance, Add in seconds, Sales & expenses, Staff attendance, Udhari tracked, Vendor accounts, Profit & Loss, Billing sales automatic.* Signup asks for shop details and says each shop is reviewed within 1 hour (9 am to 9 pm IST).
2. **Start trial screen.** For approved shops with no Expense Tracker trial yet: **Start 15-day free trial**.
3. **Overview.** Four cards, trend chart, recent transactions, **Quick Add**, plan card.
4. **Quick Add sheet.** Choose Sale, Expense or Lending, type the amount, save.
5. **Sales / Expenses.** Range buttons, total, add form, list with edit and delete.
6. **Attendance.** Staff rows with day buttons and a summary table.
7. **P&L.** KPI cards and the month, year and FY tables.
8. **Lending.** Person cards with remaining amount and a WhatsApp reminder button.
9. **Sale Vendors / Purchase Vendors.** KPI cards, vendor summary, bill-wise list.
10. **Settings.** Plan card, shop details, **Connect Billing sales**.

---

## 6. Connecting Billing sales

If the shop also uses **Stellar Forge Billing**, the two apps share one login and one shop.

1. Sign in to the Expense Tracker with the **same email** as Billing.
2. Tap **Start 15-day free trial** (the Expense Tracker has its own trial).
3. Open **Settings > Connect Billing sales** and tap **Connect Billing sales**.
4. Each day's **printed bills** are added as **one sale** for that day. Past bills are added too.

**Important:** if you already entered sales by hand for the same days, delete those manual sales, or they will be counted twice. Tapping **Disconnect** removes the automatic billing sales again.

---

## 7. Business use cases and examples

- **Kirana, closing time:** the owner opens Overview, sees today's sales from the connected bills, adds the day's vegetable and electricity expenses with Quick Add, and sees the month's net.
- **Udhari customer:** Ravi takes goods on credit. The owner adds a lend entry and sends the WhatsApp message. When Ravi pays part of it, a settle entry is added and the balance updates.
- **Helpers' salary day:** the owner opens Attendance, reads the present and absent counts for each helper and pays accordingly.
- **Wholesaler:** sale vendors show who owes the shop, bill by bill, and purchase vendors show what the shop still has to pay.
- **Month end:** P&L shows whether the month ended in profit, and the FY card shows the year so far.

**Benefits to mention in videos:** no calculator work, one place for sales, expenses, udhari and attendance, fewer forgotten payments, a quick profit view, and billing and accounts that talk to each other.

---

## 8. Signup, trial and account flow

```
Create account -> Under review (about 1 working hour) -> Approved on WhatsApp
   -> Start 15-day Expense Tracker trial -> Use everything
   -> Plan continues, or view-only mode after the trial
```

- One Stellar Forge login is one shop, shared with Billing. A Billing customer signs in here with the same email and starts the Expense Tracker's own 15-day trial.
- The trial can be started once per email for this product.
- In the **last 5 days** of the trial an orange banner shows the days left. The banner, the Settings page and the Overview all have an **Upgrade to Basic plan** button.
- After the trial, the shop is in **view-only** mode: data can be viewed, but adding and editing are off.
- Other states: **Account under review**, **Account not approved**, **Account on hold**.

---

## 9. Plans and pricing

Each Stellar Forge product has its own trial and its own plan. These are the **Expense Tracker** plans (the Billing app has the same prices for Billing).

| | **Free trial** | **Basic plan** | **Pro plan** |
|---|---|---|---|
| **Price** | Free for 15 days | **₹99 per month**, or **₹799 per year** (about a third cheaper) | **₹199 per month**, or **₹1,599 per year** |
| **Best for** | Trying the app | Owner keeping accounts | Shops with helpers who bill |
| Sales, purchases, expenses, P&L | Yes | Yes | Yes |
| Udhari and WhatsApp reminders | Yes | Yes | Yes |
| Vendor accounts and attendance | Yes | Yes | Yes |
| Billing sales connection | Yes | Yes | Yes |
| **Staff logins in Stellar Forge Billing**: staff can bill but cannot see your sales totals, earnings or reports | No | No | Yes |
| Priority WhatsApp support | No | No | Yes |
| **After it ends** | View-only | Continues while active | Continues while active |

**About Pro:** Pro is set up by the Stellar Forge team on request. The staff privacy (staff cannot see your earnings) applies to the **Billing** app, where staff create and print bills. The Expense Tracker itself has one login per shop and no separate staff roles, so keep the Expense Tracker login with the owner.

**Where plans show in the app**

- **Overview (home), at the top:** a compact plan card with status, Basic price, the upgrade button, and the Pro price with an **Ask about Pro plan** button.
- **Settings, at the very top:** the full plan card with the Basic and Pro feature lists.
- **Trial banner:** the orange and red banners include an **Upgrade to Basic plan** link.

**How upgrading works today**

1. The owner taps **Upgrade to Basic plan**.
2. WhatsApp opens a chat with **+91 92702 43271** and a ready message asking for the monthly subscription, with the shop name, mobile and email filled in.
3. The Stellar Forge team shares the payment details.
4. After payment the team sets the shop's `paid_until` date for the Expense Tracker in the admin dashboard, and the card shows **Basic plan active** with the end date. The button then becomes **Renew plan on WhatsApp**.

**Change prices or the WhatsApp number:** edit `lib/plans.ts` only (`BASIC_PLAN`, `PRO_PLAN`, `UPGRADE_WHATSAPP`). Update this table and any videos too.

---

## 10. Honest limits (what it does NOT do)

- **Internet is required.** Data is saved online.
- **No stock or inventory.** It tracks money, not items.
- **No GST returns or tax invoices.** For bills with your GST number, use Stellar Forge Billing.
- **One login per shop.** There are no staff roles inside the Expense Tracker. The Attendance page is a record of your employees, not their logins.
- **WhatsApp messages are in Marathi.** The udhari and sale-vendor messages are written in Marathi today. Hindi and English versions can be added.
- **Messages are pre-filled, not automatic.** The owner taps send in WhatsApp.
- **Purchase vendors get no messages.** That section is your own record.
- **Rupees only,** built for India.
- **Billing connection needs Billing.** The shop must have Billing enabled with the same email.

---

## 11. Video and marketing kit

### Key messages (pick 2 or 3 per video)
1. Know your profit every day, without a calculator.
2. Quick Add: a sale or expense in seconds.
3. Udhari with one-tap WhatsApp reminders.
4. Staff attendance in one tap.
5. Printed bills become sales automatically (with Billing).
6. Simple, in your pocket, 15-day free trial.

### Suggested videos
| # | Video | Length | Goal |
|---|---|---|---|
| 1 | "Know your profit" reel | 20 to 30 sec | Hook new vendors |
| 2 | Full feature tour | 3 to 4 min | Show everything in order |
| 3 | Udhari and WhatsApp reminder | 30 to 45 sec | Show the pain being solved |
| 4 | Staff attendance in one tap | 20 sec | Show a quick win |
| 5 | Connect Billing sales | 1 min | Show the two apps together |
| 6 | P&L explained in Hindi / Marathi | 1 to 2 min | Educate and build trust |
| 7 | Signup and trial walkthrough | 1 min | Remove fear of signing up |

### Sample script: 30-second reel
| Time | Visual | Voiceover |
|---|---|---|
| 0:00 to 0:04 | Notebook with crossed-out numbers. | "Month end, and the notebook doesn't add up?" |
| 0:04 to 0:12 | Open the app, tap **Quick Add**, add a sale and an expense. | "Add every sale and expense in seconds." |
| 0:12 to 0:20 | Overview cards and the P&L page. | "See your profit for the month, any time." |
| 0:20 to 0:26 | Lending page, tap the WhatsApp reminder. | "Remind udhari customers on WhatsApp." |
| 0:26 to 0:30 | Logo and "Try free for 15 days". | "Stellar Forge Expense Tracker." |

**Hindi:** "महीने के अंत में हिसाब नहीं मिल रहा? हर बिक्री और खर्च सेकंडों में जोड़ें, महीने का मुनाफ़ा कभी भी देखें, उधारी वालों को WhatsApp पर याद दिलाएँ। 15 दिन मुफ़्त आज़माइए।"

**Marathi:** "महिन्याच्या शेवटी हिशोब जुळत नाही? प्रत्येक विक्री आणि खर्च सेकंदात नोंदवा, महिन्याचा नफा कधीही पहा, उधारीवाल्यांना WhatsApp वर आठवण करून द्या. 15 दिवस मोफत वापरून पहा."

### Filming tips
- Film vertical (9:16) for Shorts and Reels, and use screen recording for the app.
- Use fake names and fake phone numbers for udhari and vendors.
- Add subtitles in English, Hindi and Marathi.
- End every video with the app name and "15-day free trial".

### Brand
- **Name:** Stellar Forge Expense Tracker. Footer line: "Powered by Stellar Forge".
- **Colors:** a warm "masala" palette of red, gold, brown and cream (see `tailwind.config.ts`).
- **Logo:** `public/sf-mark.png` and `public/sf-mark-light.png`.
- **Tone:** simple and friendly. Avoid words like "SaaS", "cloud" or "API" in vendor-facing videos.

**Hashtags:** `#SmallBusinessIndia #KiranaStore #UdhariKhata #HisaabKitaab #ShopOwner #DigitalIndia #BusinessApp`

**Support contact:** workwithstellarforge@gmail.com

---

## 12. FAQ

**Do I need Billing to use this?** No. It works on its own. Connecting Billing just adds printed bills as sales.

**Does it work without internet?** No. You need data or Wi-Fi.

**Can I edit or delete an entry?** Yes, for sales, expenses, lending and vendor entries.

**Is my data shared between shops?** No. Each shop only sees its own data.

**Will the reminders go out by themselves?** No. The app opens WhatsApp with the message ready, and you tap send.

**In which language are the reminders?** Marathi today.

**Can my staff log in?** The Expense Tracker has one login per shop. For staff who bill without seeing your earnings, see the Pro plan in Stellar Forge Billing.

**What happens after the free trial?** The shop becomes view-only. Tap **Upgrade to Basic plan** to message us on WhatsApp. Basic is ₹99 per month or ₹799 per year.

**How do I pay?** The upgrade button opens WhatsApp with a ready message. We share the payment details and activate your plan after payment.

**My bills are counted twice in sales.** Delete the manual sales you entered for the days that Billing sales were connected, or disconnect Billing sales in Settings.

---

## 13. Tech stack and project structure

**Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Supabase (database and authentication), Recharts (charts), lucide-react (icons), Vercel (hosting), Gmail API (admin alert emails).

```
sf-expense-tracker/
  app/
    dashboard/page.tsx       Overview (home)
    sales/, expenses/        Transaction pages (shared TxnPage component)
    attendance/              Staff attendance
    profit-loss/             P&L tables
    lending/                 Udhari
    sale-vendors/            Customers on account
    purchase-vendors/        Vendor purchases
    settings/page.tsx        Plan card, shop details, Billing connection
    login/, signup/          Authentication
    api/signup/route.ts      Self-signup, spam checks, admin alert
    api/start-trial/route.ts Starts the shop's own 15-day Expense Tracker trial
  components/                Nav, ShopGate (approval and trial gate), PlanCard, QuickAdd,
                             KpiCard, DataTable, TrendChart, TxnPage, LoginShowcase
  lib/                       supabase clients, shop context, finance helpers, whatsapp
                             messages, plans (prices + upgrade WhatsApp link), gmail
  public/                    icons and logo
```

---

## 14. Deploy and configuration

1. Deploy **sf-admin-dash** first (it applies migrations 0001 to 0003 to Supabase). This repo has no migrations.
2. Push this folder to its own GitHub repo, then in Vercel: Add New Project (Next.js is detected). Add the environment variables from `.env.example`.
3. In Supabase, go to Authentication, Providers, Email and turn **OFF** "Allow new users to sign up" (signup goes through `/api/signup`).

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service key. Never expose it |
| `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` | Server only | Gmail API for admin alert emails |
| `GMAIL_SENDER` | Server only | Sender address for admin alerts |
| `ADMIN_EMAILS` | Server only | Who is alerted about new signups |
| `ADMIN_DASH_URL` | Server only | Link to the admin dashboard |

```bash
npm install
npm run dev     # start locally
npm run build   # production build
```

---

## 15. Developer notes

- **Accounts:** one Stellar Forge login is one shop, shared with Billing. The `entitlements` table has one row per product (`expenses` here, `billing` for the other app), each with its own `trial_ends_at` and `paid_until`.
- **Write access:** `canWrite` is true only when the shop is approved and the `expenses` entitlement is in its trial or paid period. Otherwise the app is view-only.
- **Plans:** `lib/plans.ts` holds prices, features, the upgrade WhatsApp number, `planState()` and `upgradeUrl()`. `components/PlanCard.tsx` is used on Overview (compact) and Settings, and `ShopGate` shows the upgrade link in its banner.
- **Activating a paid plan:** set `paid_until` for the shop's `expenses` entitlement in the admin dashboard.
- **Billing sync:** Settings calls the `set_sales_sync` database function. The database objects live in the **sf-admin-dash** repo (`0003_expense.sql`).
- **WhatsApp messages:** all message text is in `lib/whatsapp.ts` (Marathi). To add another language, add new message builders there.
- **Financial year:** April to March, from `currentFinYear()` in `lib/finance.ts`.
- Telegram has been removed from this version.

---

*Powered by Stellar Forge.*
