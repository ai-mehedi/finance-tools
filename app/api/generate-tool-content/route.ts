import { ok, fail, requireAdmin, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // long-form generation can take a while

const ENDPOINT = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o"; // change to your preferred chat model

const SYSTEM = [
  "You are a credentialed personal-finance editor writing YMYL (Your Money or Your Life) content that must pass Google's highest E-E-A-T bar.",
  "You write from first-hand experience: you reference concrete numbers, realistic scenarios, and the specific rules of the stated market (US, UK or global).",
  "HARD RULE - no generic, swappable sentences. Every paragraph must be specific to THIS calculator and its primary keyword. If a sentence could be pasted onto a different calculator's page and still fit, rewrite it.",
  "Demonstrate Experience: include at least one 'in practice' or 'a common mistake we see' observation.",
  "Be accurate and current for the stated market. Use only the data points provided to you. NEVER invent statistics, limits, rates or tax figures.",
  "You sound human: vary sentence length, use plain language and the occasional second person ('you'). Avoid filler, marketing fluff and AI cliches ('in today's fast-paced world', 'unlock', 'delve', 'leverage', 'navigate the landscape', 'robust', 'seamless').",
  "Never use em dashes (—). Use commas, periods or rewrite the sentence instead.",
].join(" ");

type ResearchInput = {
  title: string;
  type: string;
  description?: string;
  market?: string; // "US" | "UK" | "global"
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  paaQuestions?: string[]; // real People Also Ask questions
  uniqueAngle?: string; // the differentiator that should shape the whole article
  dataPoints?: string; // verified figures the model MAY cite (and nothing else)
};

function buildUserPrompt({
  title,
  type,
  description,
  market = "US",
  primaryKeyword,
  secondaryKeywords = [],
  paaQuestions = [],
  uniqueAngle,
  dataPoints,
}: ResearchInput) {
  const kind = type === "calculator" ? "financial calculator" : "financial tool";
  const primary = primaryKeyword || title;

  const faqInstruction = paaQuestions.length
    ? `Answer these EXACT questions as the FAQ (they are real searches), 40 to 60 words each, plain text:\n${paaQuestions
        .map((q, i) => `${i + 1}. ${q}`)
        .join("\n")}`
    : `Write 5 to 7 real questions a user searching "${primary}" would ask, each answered in 40 to 60 words, plain text.`;

  return `Write SEO content for a ${kind} titled "${title}".
Market: ${market}.${description ? ` Context: ${description}.` : ""}
PRIMARY KEYWORD (use in the first 100 words and naturally 3-5 times total): ${primary}
${secondaryKeywords.length ? `SECONDARY KEYWORDS (weave in naturally, never stuff): ${secondaryKeywords.join(", ")}` : ""}
${uniqueAngle ? `UNIQUE ANGLE (this must shape the WHOLE article, not just one section): ${uniqueAngle}` : ""}
${dataPoints ? `VERIFIED DATA POINTS you may cite (do not invent any others): ${dataPoints}` : ""}

Return ONLY a single JSON object (no markdown, no code fences) with exactly these keys:

{
  "content": string,            // long-form HTML body, 900 to 1300 words
  "faq": [{ "question": string, "answer": string }],  // 5 to 7 items
  "metaTitle": string,          // <= 60 characters, MUST include "${primary}"
  "metaDescription": string,    // <= 155 characters, benefit-led, include "${primary}"
  "keywords": string[]          // 8 to 12 lowercase keyword phrases
}

Rules for "content":
- 900 to 1300 words of original writing specific to ${market}. No generic, swappable sentences.
- Open with a 2 to 3 sentence intro (no heading) that uses the primary keyword and states who this ${kind} is for and what decision it helps with. Specific to "${primary}", not generic.
- Include a "How this is calculated" section: the actual formula in words plus a worked example using realistic ${market} numbers.
- Include one section built around the UNIQUE ANGLE above (if given).
- Include a short comparison or scenario table relevant to the topic (e.g. how the result changes across a few realistic inputs).
- Include sections that fit the topic: key factors that change the result, common mistakes specific to THIS scenario, and who it is for.
- Demonstrate E-E-A-T with concrete numbers and at least one first-hand "in practice" observation.
- Valid semantic HTML using ONLY these tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <a>, <blockquote>, <table>, <thead>, <tbody>, <tr>, <th>, <td>. No <h1>, no <html>/<body>, no markdown, no code fences.
- Include 2 to 4 outbound links to SPECIFIC authoritative ${market} sources relevant to the topic (US: irs.gov, consumerfinance.gov, investor.gov, sec.gov, federalreserve.gov, ssa.gov; UK: gov.uk, hmrc, bankofengland.co.uk, fca.org.uk; or investopedia.com). Prefer the specific relevant section over a bare homepage, but do not invent deep URLs you are unsure of. Format: <a href="https://..." target="_blank" rel="nofollow noopener">descriptive anchor text</a>.

Rules for "faq": ${faqInstruction}

Keep every number factually careful. Output valid JSON only.`;
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
    const body = await request.json();
    const { title, type, description, market, primaryKeyword, secondaryKeywords, paaQuestions, uniqueAngle, dataPoints } = body;
    if (!title || !String(title).trim()) return fail("title is required.", 400);
    const asStr = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
    const asArr = (v: unknown) => (Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : undefined);

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
              description: asStr(description),
              market: asStr(market),
              primaryKeyword: asStr(primaryKeyword),
              secondaryKeywords: asArr(secondaryKeywords),
              paaQuestions: asArr(paaQuestions),
              uniqueAngle: asStr(uniqueAngle),
              dataPoints: asStr(dataPoints),
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
