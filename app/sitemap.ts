import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/queries";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://topicdrill.com").replace(/\/$/, "");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { tools, toolCats, articles } = await getAllSlugs();

  // Only canonical, indexable URLs belong in the sitemap. /tools now canonicals
  // to /calculators, and /blog?category= query URLs canonical to /blog, so both
  // are intentionally omitted to avoid feeding Google non-canonical duplicates.
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/calculators`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/glossary`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/faqs`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/editorial-policy`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/disclaimer`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const dt = (d?: string) => (d ? new Date(d) : undefined);

  return [
    ...staticPages,
    ...toolCats.map((c) => ({ url: `${BASE}/categories/${c.slug}`, lastModified: dt(c.updatedAt), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...tools.map((t) => ({ url: `${BASE}${t.url || `/tools/${t.slug}`}`, lastModified: dt(t.updatedAt), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...articles.map((a) => ({ url: `${BASE}/blog/${a.slug}`, lastModified: dt(a.updatedAt), changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
