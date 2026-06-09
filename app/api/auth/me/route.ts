import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { getAuth } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await getAuth();
    if (!auth) return fail("Unauthorized", 401);

    await connectToDatabase();
    const user = await UserModel.findById(auth.sub).lean();
    if (!user) return fail("Unauthorized", 401);

    return ok({ user });
  } catch (err) {
    return handleError(err);
  }
}
