import { connectToDatabase } from "@/lib/mongodb";
import { NavMenuModel } from "@/models/NavMenu";
import { ok, fail, requireAdmin, handleError, parseListQuery, paginated } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/nav-menu?location=header&q=&page=1&limit=50  (public)
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams, page, limit, q } = parseListQuery(request);
    const filter: Record<string, unknown> = {};
    const location = searchParams.get("location");
    const status = searchParams.get("status");
    if (location) filter.location = location;
    if (status) filter.status = status;
    if (q) filter.title = { $regex: q, $options: "i" };

    const [data, total] = await Promise.all([
      NavMenuModel.find(filter).sort({ order: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      NavMenuModel.countDocuments(filter),
    ]);
    return paginated(data, total, page, limit);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/nav-menu  (admin)
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await connectToDatabase();
    const body = await request.json();
    if (!body?.title) return fail("title is required.", 400);
    const item = await NavMenuModel.create(body);
    return ok({ item }, 201);
  } catch (err) {
    return handleError(err);
  }
}
