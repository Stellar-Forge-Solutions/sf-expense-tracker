import { MetadataRoute } from "next";

export const dynamic = "force-static"; // required for `output: "export"`

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stellar Forge Expense Tracker",
    short_name: "SF Expenses",
    description: "Sales, purchase & expense tracker",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#FDF6E3",
    theme_color: "#B4182A",
    orientation: "portrait",
    categories: ["business", "finance"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}