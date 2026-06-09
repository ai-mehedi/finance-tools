import { connectToDatabase } from "@/lib/mongodb";
import { ToolModel } from "@/models/Tool";
import { ok, fail, requireAdmin, handleError, parseListQuery, paginated } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/tools?type=calculator&status=active&category=<id>&q=&page=1&limit=10  (public)
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams, page, limit, q } = parseListQuery(request);
    const filter: Record<string, unknown> = {};
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.categories = category;
    if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }, { slug: { $regex: q, $options: "i" } }];

    const [data, total] = await Promise.all([
      ToolModel.find(filter)
        .populate("categories", "name slug")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ToolModel.countDocuments(filter),
    ]);
    return paginated(data, total, page, limit);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/tools  (admin)
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await connectToDatabase();
    const body = await request.json();
    if (!body?.title) return fail("title is required.", 400);
    const tool = await ToolModel.create(body);
    return ok({ tool }, 201);
  } catch (err) {
    return handleError(err);
  }
}
