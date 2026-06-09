import { connectToDatabase } from "@/lib/mongodb";
import { CategoryModel } from "@/models/Category";
import { ok, fail, requireAdmin, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// GET /api/categories/:id  (public)  — id can be an ObjectId or a slug
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const category = id.match(/^[0-9a-fA-F]{24}$/)
      ? await CategoryModel.findById(id).lean()
      : await CategoryModel.findOne({ slug: id }).lean();
    if (!category) return fail("Category not found.", 404);
    return ok({ category });
  } catch (err) {
    return handleError(err);
  }
}

// PUT /api/categories/:id  (admin)
export async function PUT(request: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();
    const category = await CategoryModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!category) return fail("Category not found.", 404);
    return ok({ category });
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/categories/:id  (admin)
export async function DELETE(_req: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await connectToDatabase();
    const category = await CategoryModel.findByIdAndDelete(id);
    if (!category) return fail("Category not found.", 404);
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
