import { ok, fail, handleError } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ArticleTopicModel } from "@/models/ArticleTopic";
import { UserModel } from "@/models/User";
import { generateAndCreateArticle } from "@/lib/article-pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // generating several articles + images is slow

const DEFAULT_COUNT = 5;

/**
 * Authorize either a logged-in admin (the dashboard button) or a scheduler that
 * presents the shared CRON_SECRET as a Bearer token or ?secret= query param.
 */
async function authorize(request: Request): Promise<boolean> {
  if (await getAuth()) return true;
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  const fromHeader = header.replace(/^Bearer\s+/i, "").trim();
  const fromQuery = new URL(request.url).searchParams.get("secret") || "";
  return fromHeader === secret || fromQuery === secret;
}

async function run(request: Request) {
  if (!(await authorize(request))) return fail("Unauthorized", 401);
  if (!process.env.OPENAI_API_KEY) return fail("OPENAI_API_KEY is not set.", 500);

  try {
    await connectToDatabase();

    const countParam = Number(new URL(request.url).searchParams.get("count"));
    const count = Math.min(20, Math.max(1, countParam || DEFAULT_COUNT));

    // Every auto-generated draft needs an author. Use the first admin user.
    const author = await UserModel.findOne().select("_id").sort({ createdAt: 1 }).lean();
    if (!author?._id) return fail("No admin user found to author articles. Seed a user first.", 500);
    const authorId = String(author._id);

    const topics = await ArticleTopicModel.find({ status: "pending" })
      .sort({ order: 1, createdAt: 1 })
      .limit(count);

    const created: { topic: string; slug: string }[] = [];
    const failed: { topic: string; error: string }[] = [];

    // Sequential + save-as-you-go: a mid-batch failure keeps earlier drafts.
    for (const topic of topics) {
      try {
        const article = await generateAndCreateArticle({
          topic: {
            title: topic.title,
            focusKeyword: topic.focusKeyword,
            secondaryKeywords: topic.secondaryKeywords,
            paaQuestions: topic.paaQuestions,
            uniqueAngle: topic.uniqueAngle,
            market: topic.market,
            categorySlug: topic.categorySlug,
          },
          authorId,
          status: "draft",
          withImage: false, // AI featured images off — images are added manually
        });
        topic.status = "generated";
        topic.articleId = article._id;
        topic.error = undefined;
        await topic.save();
        created.push({ topic: topic.title, slug: article.slug });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed";
        topic.status = "failed";
        topic.error = message;
        await topic.save();
        failed.push({ topic: topic.title, error: message });
      }
    }

    return ok({ requested: count, created: created.length, failed: failed.length, items: created, errors: failed });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: Request) {
  return run(request);
}

// Also allow GET so simple cron services (which often only do GET) can trigger it.
export async function GET(request: Request) {
  return run(request);
}
