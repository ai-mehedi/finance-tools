import { connectToDatabase } from "@/lib/mongodb";
import { ContactModel } from "@/models/Contact";
import { ok, fail, requireAdmin, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// GET /api/contact/:id  (admin)
export async function GET(_req: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await connectToDatabase();
    const contact = await ContactModel.findById(id).lean();
    if (!contact) return fail("Submission not found.", 404);
    return ok({ contact });
  } catch (err) {
    return handleError(err);
  }
}

// PATCH /api/contact/:id  (admin — e.g. update status)
export async function PATCH(request: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();
    const contact = await ContactModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!contact) return fail("Submission not found.", 404);
    return ok({ contact });
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/contact/:id  (admin)
export async function DELETE(_req: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await connectToDatabase();
    const contact = await ContactModel.findByIdAndDelete(id);
    if (!contact) return fail("Submission not found.", 404);
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
