import { connectToDatabase } from "@/lib/mongodb";
import { CategoryModel } from "@/models/Category";
import { ok, fail, requireAdmin, handleError, parseListQuery, paginated } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/categories?type=tool&status=active&q=&page=1&limit=10  (public)
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams, page, limit, q } = parseListQuery(request);
    const filter: Record<string, unknown> = {};
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (q) filter.$or = [{ name: { $regex: q, $options: "i" } }, { slug: { $regex: q, $options: "i" } }];

    const [data, total] = await Promise.all([
      CategoryModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      CategoryModel.countDocuments(filter),
    ]);
    return paginated(data, total, page, limit);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/categories  (admin)
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await connectToDatabase();
    const body = await request.json();
    if (!body?.name) return fail("name is required.", 400);
    const category = await CategoryModel.create(body);
    return ok({ category }, 201);
  } catch (err) {
    return handleError(err);
  }
}
