import { ok, fail, requireAdmin, handleError } from "@/lib/api";
import { generateArticleContent } from "@/lib/ai/article";
import { getInternalLinkTargets } from "@/lib/internal-links";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // long-form generation can take a while

// POST /api/generate-article  (admin) — generate article content WITHOUT saving.
// The editor fills the form with the result, then saves via /api/articles.
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!process.env.OPENAI_API_KEY) return fail("OPENAI_API_KEY is not set. Add it to .env.local.", 500);

  try {
    const body = await request.json();
    const { title, focusKeyword, secondaryKeywords, paaQuestions, uniqueAngle, dataPoints, market, categoryId } = body;
    if (!title || !String(title).trim()) return fail("title is required.", 400);

    const asStr = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
    const asArr = (v: unknown) => (Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : undefined);

    // Fetch real on-site link targets server-side so links are never hallucinated.
    const internalLinks = await getInternalLinkTargets({ categoryId: asStr(categoryId) });

    const result = await generateArticleContent({
      title: String(title).trim(),
      focusKeyword: asStr(focusKeyword),
      secondaryKeywords: asArr(secondaryKeywords),
      paaQuestions: asArr(paaQuestions),
      uniqueAngle: asStr(uniqueAngle),
      dataPoints: asStr(dataPoints),
      market: asStr(market),
      internalLinks,
    });

    return ok(result, 200);
  } catch (err) {
    return handleError(err);
  }
}
