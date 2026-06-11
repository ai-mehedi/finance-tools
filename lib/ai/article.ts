// Core long-form article generation against the OpenAI chat API.
// Shared by the /api/generate-article route (returns JSON to the editor) and
// the article pipeline (used by the one-click button + the daily cron).

import { SYSTEM, buildArticlePrompt, type ArticleInput } from "@/lib/ai/prompts";

const ENDPOINT = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

export type GeneratedArticle = {
  content: string;
  excerpt: string;
  focusKeyword: string;
  slug: string;
  faq: { question: string; answer: string }[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
};

/** Normalize a model-supplied slug to the same shape the Article model stores. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate a complete SEO blog article. Throws on a missing key, an API error,
 * or malformed/empty output so callers can surface a clear message.
 */
export async function generateArticleContent(input: ArticleInput): Promise<GeneratedArticle> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set. Add it to .env.local.");

  if (!input.title || !input.title.trim()) throw new Error("title is required.");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildArticlePrompt(input) },
      ],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Content generation failed.");

  const raw = data?.choices?.[0]?.message?.content as string | undefined;
  if (!raw) throw new Error("No content returned from OpenAI.");

  let parsed: Partial<GeneratedArticle>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("OpenAI returned malformed JSON. Try again.");
  }

  const result: GeneratedArticle = {
    content: typeof parsed.content === "string" ? parsed.content.trim() : "",
    excerpt: typeof parsed.excerpt === "string" ? parsed.excerpt.trim() : "",
    focusKeyword: typeof parsed.focusKeyword === "string" ? parsed.focusKeyword.trim() : "",
    slug: typeof parsed.slug === "string" ? slugify(parsed.slug) : "",
    faq: Array.isArray(parsed.faq)
      ? parsed.faq
          .map((f) => ({
            question: typeof f?.question === "string" ? f.question.trim() : "",
            answer: typeof f?.answer === "string" ? f.answer.trim() : "",
          }))
          .filter((f) => f.question && f.answer)
      : [],
    metaTitle: typeof parsed.metaTitle === "string" ? parsed.metaTitle.trim() : "",
    metaDescription: typeof parsed.metaDescription === "string" ? parsed.metaDescription.trim() : "",
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map((k) => String(k).trim()).filter(Boolean) : [],
  };

  if (!result.content) throw new Error("OpenAI returned empty content. Try again.");
  return result;
}
