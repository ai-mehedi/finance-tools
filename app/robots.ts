import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://topicdrill.com").replace(/\/$/, "");

// AI / answer-engine crawlers we explicitly welcome so our calculators and guides
// can be read, cited and recommended by AI assistants (ChatGPT, Claude, Perplexity,
// Gemini, Copilot, etc.). The "*" rule already allows them, but listing them
// explicitly makes the intent clear and future-proof.
const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "DuckAssistBot",
  "YouBot",
  "Diffbot",
  "Timpibot",
];

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/admin/", "/api/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      // Explicitly allow every major AI crawler full access to public content.
      { userAgent: AI_BOTS, allow: "/", disallow },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
