import { connectToDatabase } from "@/lib/mongodb";
import { SubscriberModel } from "@/models/Subscriber";
import { ok, fail, requireAdmin, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/subscribers/:id  (admin — e.g. mark unsubscribed)
export async function PATCH(request: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();
    const subscriber = await SubscriberModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!subscriber) return fail("Subscriber not found.", 404);
    return ok({ subscriber });
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/subscribers/:id  (admin)
export async function DELETE(_req: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await connectToDatabase();
    const subscriber = await SubscriberModel.findByIdAndDelete(id);
    if (!subscriber) return fail("Subscriber not found.", 404);
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
