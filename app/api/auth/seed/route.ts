import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * One-time bootstrap for the first admin. Only works while there are zero
 * users — afterwards it refuses, so it can't be abused to create extra admins.
 * There is intentionally no public registration endpoint.
 */
export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const count = await UserModel.estimatedDocumentCount();
    if (count > 0) {
      return fail("Admin already exists. Seeding is disabled.", 403);
    }

    const { firstname, lastname, email, password } = await request.json();
    if (!firstname || !lastname || !email || !password) {
      return fail("firstname, lastname, email and password are required.", 400);
    }
    if (String(password).length < 8) {
      return fail("Password must be at least 8 characters.", 422);
    }

    const user = await UserModel.create({ firstname, lastname, email, password });
    return ok(
      {
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
        },
      },
      201
    );
  } catch (err) {
    return handleError(err);
  }
}
