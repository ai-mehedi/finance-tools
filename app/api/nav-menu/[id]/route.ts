import { connectToDatabase } from "@/lib/mongodb";
import { NavMenuModel } from "@/models/NavMenu";
import { ok, fail, requireAdmin, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// GET /api/nav-menu/:id  (public)
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const item = await NavMenuModel.findById(id).lean();
    if (!item) return fail("Menu item not found.", 404);
    return ok({ item });
  } catch (err) {
    return handleError(err);
  }
}

// PUT /api/nav-menu/:id  (admin)
export async function PUT(request: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();
    const item = await NavMenuModel.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!item) return fail("Menu item not found.", 404);
    return ok({ item });
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/nav-menu/:id  (admin)
export async function DELETE(_req: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await connectToDatabase();
    const item = await NavMenuModel.findByIdAndDelete(id);
    if (!item) return fail("Menu item not found.", 404);
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
