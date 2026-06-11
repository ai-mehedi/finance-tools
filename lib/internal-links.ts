// Build a list of real, on-site link targets the article generator can weave in.
// Returning only existing URLs is what stops the model hallucinating internal
// links: it can only pick from what we hand it.

import { connectToDatabase } from "@/lib/mongodb";
import { ArticleModel } from "@/models/Article";
import { ToolModel } from "@/models/Tool";
import type { InternalLink } from "@/lib/ai/prompts";

export type { InternalLink };

/** Canonical on-site path for a tool/calculator doc. */
function toolPath(t: { url?: string; slug: string; type?: string }): string {
  if (t.url && t.url.trim()) return t.url.trim();
  return `/${t.type === "calculator" ? "calculators" : "tools"}/${t.slug}`;
}

/**
 * Gather candidate internal-link targets, biased toward the article's own
 * blog category, plus a spread of finance tools/calculators. The generator
 * picks 3 to 6 of these to embed with natural anchors.
 */
export async function getInternalLinkTargets({
  categoryId,
  excludeSlug,
  limit = 24,
}: {
  categoryId?: string;
  excludeSlug?: string;
  limit?: number;
} = {}): Promise<InternalLink[]> {
  await connectToDatabase();

  const articleFilter: Record<string, unknown> = { status: "published" };
  if (excludeSlug) articleFilter.slug = { $ne: excludeSlug };

  // Prefer same-category articles first, then fill with recent ones.
  const sameCat = categoryId
    ? await ArticleModel.find({ ...articleFilter, categories: categoryId })
        .select("title slug focusKeyword")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    : [];

  const otherArticles = await ArticleModel.find(articleFilter)
    .select("title slug focusKeyword")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const tools = await ToolModel.find({ status: "active" })
    .select("title slug url type keywords")
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

  const links: InternalLink[] = [];
  const seen = new Set<string>();
  const push = (title: string, url: string, focusKeyword?: string) => {
    if (!title || !url || seen.has(url)) return;
    seen.add(url);
    links.push({ title, url, focusKeyword });
  };

  for (const a of [...sameCat, ...otherArticles] as { title: string; slug: string; focusKeyword?: string }[]) {
    push(a.title, `/blog/${a.slug}`, a.focusKeyword);
  }
  for (const t of tools as { title: string; slug: string; url?: string; type?: string; keywords?: string[] }[]) {
    push(t.title, toolPath(t), t.keywords?.[0]);
  }

  return links.slice(0, limit);
}
