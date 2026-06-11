// End-to-end: topic -> generated draft Article. Used by the daily cron and the
// admin "generate batch" button. The interactive one-click button uses the
// /api/generate-article route directly (it fills the form for review instead).

import { connectToDatabase } from "@/lib/mongodb";
import { ArticleModel } from "@/models/Article";
import { CategoryModel } from "@/models/Category";
import { generateArticleContent } from "@/lib/ai/article";
import { generateFeaturedImage } from "@/lib/ai/image";
import { getInternalLinkTargets } from "@/lib/internal-links";
import type { ArticleStatus } from "@/models/Article";

export type TopicInput = {
  title: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  paaQuestions?: string[];
  uniqueAngle?: string;
  market?: string;
  categorySlug?: string;
};

/** Render the structured FAQ as an HTML section appended to the article body. */
function faqToHtml(faq: { question: string; answer: string }[]): string {
  if (!faq.length) return "";
  const items = faq
    .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
    .join("\n");
  return `\n<h2>Frequently Asked Questions</h2>\n${items}`;
}

/**
 * Generate a full article from a topic and persist it. Returns the created doc.
 * Throws on generation failure so the caller can mark the topic failed.
 */
export async function generateAndCreateArticle({
  topic,
  authorId,
  status = "draft",
  withImage = false,
}: {
  topic: TopicInput;
  authorId: string;
  status?: ArticleStatus;
  withImage?: boolean;
}) {
  await connectToDatabase();

  // Resolve the blog category (if any) to its id for filtering + assignment.
  const category = topic.categorySlug
    ? await CategoryModel.findOne({ slug: topic.categorySlug, type: "blog" }).select("_id").lean()
    : null;
  const categoryId = category?._id ? String(category._id) : undefined;

  const internalLinks = await getInternalLinkTargets({ categoryId });

  const generated = await generateArticleContent({
    title: topic.title,
    focusKeyword: topic.focusKeyword,
    secondaryKeywords: topic.secondaryKeywords,
    paaQuestions: topic.paaQuestions,
    uniqueAngle: topic.uniqueAngle,
    market: topic.market,
    internalLinks,
  });

  // Featured image is best-effort: a failed image must not lose a good article.
  let featuredImage: string | undefined;
  if (withImage) {
    try {
      const img = await generateFeaturedImage(topic.title);
      featuredImage = img.url;
    } catch (err) {
      console.error("Featured image generation failed for:", topic.title, err);
    }
  }

  const content = generated.content + faqToHtml(generated.faq);

  const article = await ArticleModel.create({
    title: topic.title,
    ...(generated.slug ? { slug: generated.slug } : {}),
    focusKeyword: topic.focusKeyword || generated.focusKeyword,
    excerpt: generated.excerpt,
    content,
    faq: generated.faq,
    categories: categoryId ? [categoryId] : [],
    author: authorId,
    featuredImage,
    status,
    metaTitle: generated.metaTitle,
    metaDescription: generated.metaDescription,
    keywords: generated.keywords,
  });

  return article;
}
