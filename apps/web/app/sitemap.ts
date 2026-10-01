import type { MetadataRoute } from "next";
import en from "../../../content/en.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const paths = ["", "/about", "/why-invest", "/sectors", "/agenda", "/invest", "/support", "/downloads", "/media", "/contact", "/privacy", "/terms", "/status"];
  const sectorPaths = en.sectors.items.map((item) => `/sectors/${item.slug}`);
  return [...paths, ...sectorPaths].map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "weekly",
    priority: path === "" || path === "/invest" ? 1 : 0.6,
  }));
}
