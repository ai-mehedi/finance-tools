import { connectToDatabase } from "@/lib/mongodb";
import { UserModel, type UserDoc } from "@/models/User";
import { signToken, AUTH_COOKIE, cookieOptions } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return fail("Email and password are required.", 400);

    await connectToDatabase();
    const user = (await UserModel.findOne({ email: String(email).toLowerCase() }).select(
      "+password"
    )) as UserDoc | null;

    if (!user || !(await user.comparePassword(password))) {
      return fail("Invalid email or password.", 401);
    }
    if (user.status !== "active") {
      return fail("This account is not active.", 403);
    }

    const token = signToken({ sub: user.id, email: user.email });
    const res = ok({
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        avatar: user.avatar,
      },
    });
    res.cookies.set(AUTH_COOKIE, token, cookieOptions);
    return res;
  } catch (err) {
    return handleError(err);
  }
}
