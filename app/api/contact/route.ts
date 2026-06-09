import { connectToDatabase } from "@/lib/mongodb";
import { ContactModel } from "@/models/Contact";
import { ok, fail, requireAdmin, handleError, parseListQuery, paginated } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/contact  (public — contact form submission)
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { name, email, phone, subject, message } = await request.json();
    if (!name || !email || !message) {
      return fail("name, email and message are required.", 400);
    }
    const contact = await ContactModel.create({ name, email, phone, subject, message });
    return ok({ success: true, id: contact.id }, 201);
  } catch (err) {
    return handleError(err);
  }
}

// GET /api/contact?status=new&q=&page=1&limit=10  (admin — list submissions)
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await connectToDatabase();
    const { searchParams, page, limit, q } = parseListQuery(request);
    const filter: Record<string, unknown> = {};
    const status = searchParams.get("status");
    if (status) filter.status = status;
    if (q)
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
      ];

    const [data, total] = await Promise.all([
      ContactModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      ContactModel.countDocuments(filter),
    ]);
    return paginated(data, total, page, limit);
  } catch (err) {
    return handleError(err);
  }
}
