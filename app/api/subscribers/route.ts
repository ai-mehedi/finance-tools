import { connectToDatabase } from "@/lib/mongodb";
import { SubscriberModel } from "@/models/Subscriber";
import { ok, fail, requireAdmin, handleError, parseListQuery, paginated } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/subscribers  (public — newsletter signup)
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email, source } = await request.json();
    if (!email) return fail("email is required.", 400);

    const normalized = String(email).toLowerCase().trim();
    // Idempotent: re-subscribe if previously unsubscribed, otherwise create.
    const subscriber = await SubscriberModel.findOneAndUpdate(
      { email: normalized },
      { $set: { status: "subscribed", source }, $setOnInsert: { email: normalized } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return ok({ success: true, id: subscriber.id }, 201);
  } catch (err) {
    return handleError(err);
  }
}

// GET /api/subscribers?status=subscribed&q=&page=1&limit=10  (admin)
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await connectToDatabase();
    const { searchParams, page, limit, q } = parseListQuery(request);
    const filter: Record<string, unknown> = {};
    const status = searchParams.get("status");
    if (status) filter.status = status;
    if (q) filter.email = { $regex: q, $options: "i" };

    const [data, total] = await Promise.all([
      SubscriberModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      SubscriberModel.countDocuments(filter),
    ]);
    return paginated(data, total, page, limit);
  } catch (err) {
    return handleError(err);
  }
}
