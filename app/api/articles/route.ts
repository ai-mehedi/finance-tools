import { connectToDatabase } from "@/lib/mongodb";
import { ArticleModel } from "@/models/Article";
import { ok, fail, requireAdmin, handleError, parseListQuery, paginated } from "@/lib/api";
import { pingIndexNow } from "@/lib/indexnow";

export const dynamic = "force-dynamic";

// GET /api/articles?status=published&category=<id>&author=<id>&q=&page=1&limit=10  (public)
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams, page, limit, q } = parseListQuery(request);
    const filter: Record<string, unknown> = {};
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const author = searchParams.get("author");
    if (status) filter.status = status;
    if (category) filter.categories = category;
    if (author) filter.author = author;
    if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }, { slug: { $regex: q, $options: "i" } }];

    const [data, total] = await Promise.all([
      ArticleModel.find(filter)
        .populate("author", "firstname lastname avatar")
        .populate("categories", "name slug")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ArticleModel.countDocuments(filter),
    ]);

    return paginated(data, total, page, limit);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/articles  (admin)
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await connectToDatabase();
    const body = await request.json();
    if (!body?.title) return fail("title is required.", 400);
    if (!body?.author) return fail("author is required.", 400);
    const article = await ArticleModel.create(body);
    if (article.status === "published") await pingIndexNow([`/blog/${article.slug}`]);
    return ok({ article }, 201);
  } catch (err) {
    return handleError(err);
  }
}
