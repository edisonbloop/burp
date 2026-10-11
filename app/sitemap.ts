import type { MetadataRoute } from "next";

const BASE = "https://www.burp.ink";

const routes: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/burp-it", priority: 0.9, changeFrequency: "daily" },
  { path: "/scripture", priority: 0.8, changeFrequency: "monthly" },
  { path: "/library", priority: 0.8, changeFrequency: "weekly" },
  { path: "/stones", priority: 0.7, changeFrequency: "weekly" },
  { path: "/100stones", priority: 0.7, changeFrequency: "monthly" },
  { path: "/200stones", priority: 0.7, changeFrequency: "monthly" },
  { path: "/attributes", priority: 0.6, changeFrequency: "weekly" },
  { path: "/sharehouse", priority: 0.6, changeFrequency: "weekly" },
  { path: "/bulletin", priority: 0.6, changeFrequency: "weekly" },
  { path: "/timetable", priority: 0.5, changeFrequency: "weekly" },
  { path: "/worship", priority: 0.5, changeFrequency: "monthly" },
  { path: "/games", priority: 0.4, changeFrequency: "monthly" },
  { path: "/community", priority: 0.4, changeFrequency: "weekly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${BASE}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
