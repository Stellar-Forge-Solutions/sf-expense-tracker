"use client";
import { useEffect, useRef, useState } from "react";
import { AD_SLOTS, ADSENSE_PUBLISHER_ID } from "@/lib/plans";

const isDev = process.env.NODE_ENV === "development";
const adsenseEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

let scriptLoaded = false;

function loadAdScript() {
  if (scriptLoaded || typeof window === "undefined") return;
  // Only load once, only for free-plan pages
  const existing = document.querySelector('script[data-adscript="adsense"]');
  if (existing) { scriptLoaded = true; return; }
  const s = document.createElement("script");
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;
  s.async = true;
  s.crossOrigin = "anonymous";
  s.setAttribute("data-adscript", "adsense");
  document.head.appendChild(s);
  scriptLoaded = true;
}

type SlotKey = keyof typeof AD_SLOTS;

interface AdBannerProps {
  slot: SlotKey;
  /** true = Free plan user on an allowed page */
  showAds: boolean;
}

/**
 * AdBanner — renders a single AdSense horizontal banner for Free plan users.
 *
 * Rules:
 * - Only renders when showAds = true AND NEXT_PUBLIC_ADSENSE_ENABLED = "true"
 * - In development: shows a gray placeholder (not in production)
 * - Lazy-loaded via IntersectionObserver
 * - One push() per mounted component, guarded against double-push
 * - Hidden in print CSS (@media print in globals.css)
 */
export default function AdBanner({ slot, showAds }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const pushed = useRef(false);

  useEffect(() => {
    if (!showAds) return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [showAds]);

  useEffect(() => {
    if (!visible || pushed.current) return;
    if (adsenseEnabled) {
      loadAdScript();
      try {
        // Guard: only push once per mount
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        pushed.current = true;
      } catch (e) {
        // AdSense not loaded yet; will be picked up when script loads
      }
    }
  }, [visible]);

  // Not a free-plan page — render nothing
  if (!showAds) return null;

  // Development placeholder (never shown in production)
  if (isDev && !adsenseEnabled) {
    return (
      <div
        ref={containerRef}
        className="ad-slot mx-auto my-8 flex items-center justify-center rounded bg-masala-brown/5 border border-dashed border-masala-brown/20 text-masala-brown/30 text-xs"
        style={{ maxWidth: 728, width: "100%", minHeight: 90 }}
      >
        Ad placeholder (dev only)
      </div>
    );
  }

  // Production: real ad unit, shown only when NEXT_PUBLIC_ADSENSE_ENABLED=true
  if (!adsenseEnabled) return null;

  return (
    <div
      ref={containerRef}
      className="ad-slot"
      style={{ maxWidth: 728, width: "100%", margin: "32px auto 0", minHeight: 90 }}
    >
      {visible && (
        <>
          <p className="ad-label text-[10px] text-masala-brown/30 text-center mb-1 select-none">
            Advertisement
          </p>
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={ADSENSE_PUBLISHER_ID}
            data-ad-slot={AD_SLOTS[slot]}
            data-ad-format="horizontal"
            data-full-width-responsive="false"
          />
        </>
      )}
    </div>
  );
}
