import { connectToDatabase } from "@/lib/mongodb";
import { ArticleModel } from "@/models/Article";
import { ok, fail, requireAdmin, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// GET /api/articles/:id  (public) — id can be an ObjectId or a slug
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    const article = await ArticleModel.findOne(query)
      .populate("author", "firstname lastname avatar")
      .populate("categories", "name slug")
      .lean();
    if (!article) return fail("Article not found.", 404);
    return ok({ article });
  } catch (err) {
    return handleError(err);
  }
}

// PUT /api/articles/:id  (admin)
export async function PUT(request: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();
    const article = await ArticleModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!article) return fail("Article not found.", 404);
    return ok({ article });
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/articles/:id  (admin)
export async function DELETE(_req: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await connectToDatabase();
    const article = await ArticleModel.findByIdAndDelete(id);
    if (!article) return fail("Article not found.", 404);
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
