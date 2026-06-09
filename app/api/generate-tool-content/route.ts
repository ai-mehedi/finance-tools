import { ok, fail, requireAdmin, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // long-form generation can take a while

const ENDPOINT = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o"; // change to your preferred chat model

const SYSTEM = [
  "You are an experienced personal-finance writer and editor with hands-on expertise in budgeting, loans, mortgages, investing, taxes, savings and retirement.",
  "You write clear, accurate, genuinely helpful content that demonstrates Google E-E-A-T (Experience, Expertise, Authoritativeness, Trust).",
  "You sound human: vary sentence length, use plain language and the occasional second person ('you'), and avoid robotic phrasing, filler, marketing fluff and AI cliches ('in today's fast-paced world', 'unlock', 'delve', 'leverage', 'navigate the landscape').",
  "Never use em dashes (—). Use commas, periods or rewrite the sentence instead.",
].join(" ");

function buildUserPrompt({
  title,
  type,
  description,
}: {
  title: string;
  type: string;
  description?: string;
}) {
  const kind = type === "calculator" ? "financial calculator" : "financial tool";
  return `Write SEO content for a ${kind} titled "${title}".${
    description ? ` Extra context: ${description}.` : ""
}

Return ONLY a single JSON object (no markdown, no code fences) with exactly these keys:

{
  "content": string,            // long-form HTML body, 1000+ words
  "faq": [{ "question": string, "answer": string }],  // 5 to 7 items
  "metaTitle": string,          // <= 60 characters, include the tool name
  "metaDescription": string,    // <= 155 characters, compelling, include the main keyword
  "keywords": string[]          // 8 to 12 lowercase keyword phrases
}

Rules for "content":
- At least 1000 words of original, genuinely useful, human-sounding writing.
- Valid semantic HTML using ONLY these tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <a>, <blockquote>, <table>, <thead>, <tbody>, <tr>, <th>, <td>. No <h1>, no <html>/<body>, no markdown, no code fences.
- Logical structure: a short intro paragraph (no heading), then sections such as: what it is, how it works (include the formula in words and a simple worked example), how to use this ${kind}, key factors that affect the result, practical tips, common mistakes to avoid, and who it is for. Adapt sections to the topic.
- Demonstrate E-E-A-T with concrete numbers, realistic examples and balanced, accurate explanations.
- Include 2 to 4 outbound hyperlinks to authoritative THIRD-PARTY sources relevant to the topic. Only link to widely known, trustworthy domains (for example: consumerfinance.gov, irs.gov, investor.gov, sec.gov, federalreserve.gov, ftc.gov, ssa.gov, or investopedia.com), and only to their homepage or well-established section pages. Do not invent deep or specific article URLs. Format every link as <a href="https://..." target="_blank" rel="nofollow noopener">descriptive anchor text</a>.

Rules for "faq": 5 to 7 real questions a user would ask, each answer 40 to 70 words, plain text (no HTML).
Keep everything factually careful. Output valid JSON only.`;
}

type Generated = {
  content: string;
  faq: { question: string; answer: string }[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
};

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fail("OPENAI_API_KEY is not set. Add it to .env.local.", 500);

  try {
    const { title, type, description } = await request.json();
    if (!title || !String(title).trim()) return fail("title is required.", 400);

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: buildUserPrompt({
              title: String(title).trim(),
              type: type === "calculator" ? "calculator" : "tool",
              description: description ? String(description).trim() : undefined,
            }),
          },
        ],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const message = data?.error?.message ?? "Content generation failed.";
      return fail(message, res.status);
    }

    const raw = data?.choices?.[0]?.message?.content as string | undefined;
    if (!raw) return fail("No content returned from OpenAI.", 502);

    let parsed: Partial<Generated>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return fail("OpenAI returned malformed JSON. Try again.", 502);
    }

    // Normalize / defend against missing or malformed fields.
    const result: Generated = {
      content: typeof parsed.content === "string" ? parsed.content.trim() : "",
      faq: Array.isArray(parsed.faq)
        ? parsed.faq
            .map((f) => ({
              question: typeof f?.question === "string" ? f.question.trim() : "",
              answer: typeof f?.answer === "string" ? f.answer.trim() : "",
            }))
            .filter((f) => f.question && f.answer)
        : [],
      metaTitle: typeof parsed.metaTitle === "string" ? parsed.metaTitle.trim() : "",
      metaDescription:
        typeof parsed.metaDescription === "string" ? parsed.metaDescription.trim() : "",
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.map((k) => String(k).trim()).filter(Boolean)
        : [],
    };

    if (!result.content) return fail("OpenAI returned empty content. Try again.", 502);

    return ok(result, 200);
  } catch (err) {
    return handleError(err);
  }
}
