import { ok, fail, requireAdmin, handleError } from "@/lib/api";
import { pingIndexNow } from "@/lib/indexnow";
import { getAllSlugs } from "@/lib/queries";

export const dynamic = "force-dynamic";

// POST /api/indexnow  (admin)
//   { "urls": ["/calculators/loan-calculator", ...] }  → submit just those
//   { "all": true }                                    → submit the whole site
//
// Use { all: true } once after a big change (e.g. fixing broken URLs) to ask
// Bing/Yandex to recrawl everything. Day-to-day, publishing a tool or article
// already pings IndexNow automatically.
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json().catch(() => ({}));
    let paths: string[] = [];

    if (Array.isArray(body?.urls) && body.urls.length) {
      paths = body.urls.filter((u: unknown) => typeof u === "string");
    } else if (body?.all) {
      const { tools, toolCats, articles } = await getAllSlugs();
      paths = [
        "/",
        "/calculators",
        "/categories",
        "/blog",
        ...toolCats.map((c) => `/categories/${c.slug}`),
        ...tools.map((t) => t.url || `/tools/${t.slug}`),
        ...articles.map((a) => `/blog/${a.slug}`),
      ];
    } else {
      return fail('Provide { "urls": string[] } or { "all": true }.', 400);
    }

    await pingIndexNow(paths);
    return ok({ submitted: paths.length });
  } catch (err) {
    return handleError(err);
  }
}
