import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ShopProvider } from "@/lib/shop";
import ShopGate from "@/components/ShopGate";

export const metadata: Metadata = {
  title: "Stellar Forge Expense Tracker",
  description: "Sales, purchase & expense tracker",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "SF Expenses" },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, themeColor: "#B4182A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SF Expenses" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="SF Expenses" />
      </head>
      <body className="bg-masala-cream text-masala-brown min-h-screen antialiased">
        <ShopProvider><ShopGate>{children}</ShopGate></ShopProvider>
      </body>
    </html>
  );
}
