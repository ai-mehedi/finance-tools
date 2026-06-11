// Shared OpenAI prompt building for YMYL personal-finance content.
//
// The SYSTEM block is the single source of truth for the editorial voice and
// E-E-A-T bar. It is reused by the tool-content route and the blog-article
// generator so both write in the same credentialed, anti-fluff style.

export const SYSTEM = [
  "You are a credentialed personal-finance editor writing YMYL (Your Money or Your Life) content that must pass Google's highest E-E-A-T bar.",
  "You write from first-hand experience: you reference concrete numbers, realistic scenarios, and the specific rules of the stated market (US, UK or global).",
  "HARD RULE - no generic, swappable sentences. Every paragraph must be specific to THIS topic and its primary keyword. If a sentence could be pasted onto a different article and still fit, rewrite it.",
  "Write with real human emotion and empathy: name the stress, relief, fear, pride or regret a real person feels about money, and speak to them with warmth and reassurance, never as a flat robotic explainer.",
  "Ground your key points in real-life examples and short relatable stories (a named-but-fictional person in a believable everyday situation) so the reader sees themselves on the page.",
  "Demonstrate Experience: include at least one 'in practice' or 'a common mistake we see' observation.",
  "Be accurate and current for the stated market. Use only the data points provided to you. NEVER invent statistics, limits, rates or tax figures.",
  "You sound human: vary sentence length, mix short punchy sentences with longer ones, use plain language and the occasional second person ('you'), ask the reader a direct question now and then, and let a little personality and honest opinion show. Avoid filler, marketing fluff and AI cliches ('in today's fast-paced world', 'unlock', 'delve', 'leverage', 'navigate the landscape', 'robust', 'seamless').",
  "Do NOT write like AI. Never use em dashes (—), and never use hyphen-joined asides to splice clauses together; use commas, periods or rewrite the sentence. Avoid the tell-tale 'it's not just X, it's Y' construction and the over-balanced list-of-three rhythm that AI overuses.",
].join(" ");

// The only HTML tags downstream rendering (tiptap) supports. Keep both prompts in sync.
export const ALLOWED_HTML_TAGS =
  "<h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <a>, <blockquote>, <table>, <thead>, <tbody>, <tr>, <th>, <td>";

export type InternalLink = { title: string; url: string; focusKeyword?: string };

export type ArticleInput = {
  title: string;
  market?: string; // "US" | "UK" | "global"
  focusKeyword?: string;
  secondaryKeywords?: string[];
  paaQuestions?: string[]; // real People Also Ask questions
  uniqueAngle?: string;
  dataPoints?: string; // verified figures the model MAY cite (and nothing else)
  internalLinks?: InternalLink[]; // real on-site URLs the model may link to
};

/**
 * Build the user prompt for a long-form (1500+ word) SEO blog article.
 * Returns JSON with: content, excerpt, faq, metaTitle, metaDescription, keywords.
 */
export function buildArticlePrompt({
  title,
  market = "US",
  focusKeyword,
  secondaryKeywords = [],
  paaQuestions = [],
  uniqueAngle,
  dataPoints,
  internalLinks = [],
}: ArticleInput): string {
  const primary = focusKeyword || title;

  const faqInstruction = paaQuestions.length
    ? `Answer these EXACT questions as the FAQ (they are real searches), 40 to 70 words each, plain text:\n${paaQuestions
        .map((q, i) => `${i + 1}. ${q}`)
        .join("\n")}`
    : `Write 5 to 7 real questions a person searching "${primary}" would ask, each answered in 40 to 70 words, plain text.`;

  const internalLinkBlock = internalLinks.length
    ? `INTERNAL LINKS you SHOULD weave in (pick 3 to 6 that are genuinely relevant; use the EXACT url, never invent on-site URLs):\n${internalLinks
        .map((l) => `- ${l.title} -> ${l.url}${l.focusKeyword ? ` (about: ${l.focusKeyword})` : ""}`)
        .join("\n")}`
    : "INTERNAL LINKS: none supplied, so do not invent any on-site (relative or topicdrill.com) URLs.";

  return `Write a complete, original SEO blog article titled "${title}".
Market: ${market}.
PRIMARY KEYWORD (use in the title sense, in the first 100 words, and naturally 3 to 5 times total): ${primary}
${secondaryKeywords.length ? `SECONDARY KEYWORDS (weave in naturally, never stuff): ${secondaryKeywords.join(", ")}` : ""}
${uniqueAngle ? `UNIQUE ANGLE (this must shape the WHOLE article, not just one section): ${uniqueAngle}` : ""}
${dataPoints ? `VERIFIED DATA POINTS you may cite (do not invent any others): ${dataPoints}` : ""}
${internalLinkBlock}

Return ONLY a single JSON object (no markdown, no code fences) with exactly these keys:

{
  "content": string,            // long-form HTML body, 1500 to 1900 words
  "excerpt": string,            // 1 to 2 sentence summary, <= 160 characters, includes "${primary}"
  "focusKeyword": string,       // the single primary keyword this article targets (lowercase): "${primary}"
  "slug": string,               // SEO URL slug, lowercase words joined by hyphens, 3 to 7 words, no stop-word padding, derived from the primary keyword / title
  "faq": [{ "question": string, "answer": string }],  // 5 to 7 items
  "metaTitle": string,          // <= 60 characters, MUST include "${primary}"
  "metaDescription": string,    // <= 155 characters, benefit-led, include "${primary}"
  "keywords": string[]          // 8 to 12 lowercase keyword phrases
}

Rules for "content":
- 1500 to 1900 words of original writing specific to ${market}. No generic, swappable sentences.
- Open with a 2 to 3 sentence intro (no heading) that uses the primary keyword and states who this article is for and what decision or problem it helps with.
- Use a clear H2/H3 structure (6 to 9 <h2> sections). Cover the topic in real depth.
- Include at least one worked example with realistic ${market} numbers, and at least one comparison or scenario <table> (e.g. how an outcome changes across a few realistic inputs).
- Tell at least one short real-life style story or mini case study about a believable, named (fictional) person in this ${market}, and write it with the real emotion that person would feel (the worry before, the relief or regret after). The reader should recognise themselves.
- Include at least one <blockquote> with a memorable, human takeaway, a relatable sentiment, or a quotable rule of thumb. Do NOT fabricate a quote from a real named person or invent a statistic inside it.
- Build one section around the UNIQUE ANGLE above (if given).
- Include sections that fit the topic: key factors, common mistakes specific to THIS topic, step-by-step where relevant, and who it is for.
- Demonstrate E-E-A-T with concrete numbers and at least one first-hand "in practice" observation.
- Weave in 3 to 6 of the supplied INTERNAL LINKS using their exact urls and natural anchor text: <a href="/exact/path">descriptive anchor</a> (these are same-site, so NO target/rel attributes).
- Include 2 to 4 outbound links to SPECIFIC authoritative ${market} sources (US: irs.gov, consumerfinance.gov, investor.gov, sec.gov, federalreserve.gov, ssa.gov; UK: gov.uk, hmrc, bankofengland.co.uk, fca.org.uk; or investopedia.com). Prefer the specific relevant section over a bare homepage, but do not invent deep URLs you are unsure of. Format: <a href="https://..." target="_blank" rel="nofollow noopener">descriptive anchor text</a>.
- Do NOT include the page <h1> or a "Frequently Asked Questions" section in "content" (the FAQ is returned separately and rendered by the site).
- Valid semantic HTML using ONLY these tags: ${ALLOWED_HTML_TAGS}. No <h1>, no <html>/<body>, no markdown, no code fences.

Rules for "faq": ${faqInstruction}

Keep every number factually careful. Output valid JSON only.`;
}
