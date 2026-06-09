import { connectToDatabase } from "@/lib/mongodb";
import { ToolModel } from "@/models/Tool";
import { ok, fail, requireAdmin, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// GET /api/tools/:id  (public) — id can be an ObjectId or a slug
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    const tool = await ToolModel.findOne(query).populate("categories", "name slug").lean();
    if (!tool) return fail("Tool not found.", 404);
    return ok({ tool });
  } catch (err) {
    return handleError(err);
  }
}

// PUT /api/tools/:id  (admin)
export async function PUT(request: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();
    const tool = await ToolModel.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!tool) return fail("Tool not found.", 404);
    return ok({ tool });
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/tools/:id  (admin)
export async function DELETE(_req: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await connectToDatabase();
    const tool = await ToolModel.findByIdAndDelete(id);
    if (!tool) return fail("Tool not found.", 404);
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
