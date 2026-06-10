export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://topicdrill.com").replace(/\/$/, "");
export const SITE_NAME = "TopicDrill";
export const SITE_DESC =
  "Free, fast financial calculators and clear money guides. No sign-ups, no clutter.";
export const PUBLISHER_LOGO = `${SITE_URL}/hero.webp`;

export const abs = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

// Real brand/social profiles for the Organization entity. YMYL E-E-A-T: an
// entity Google can verify ranks better. TODO: add your REAL profile URLs only
// (an empty array is better than links that 404).
export const SOCIAL_PROFILES: string[] = [
  // "https://twitter.com/topicdrill",
  // "https://www.linkedin.com/company/topicdrill",
  // "https://www.facebook.com/topicdrill",
];

// Site-wide "last reviewed" label shown on calculator pages when a page does not
// pass its own `updated`. Bump after a content review pass.
export const LAST_REVIEWED = "June 2026";

// The human accountable for money content. Finance is YMYL: Google wants a real,
// named, credentialed person. TODO: replace with a real editor/reviewer — do not
// invent a person. Leave `reviewer.name` empty until you have a genuine one.
export const EDITORIAL = {
  author: { name: "TopicDrill Editorial Team", url: `${SITE_URL}/about` },
  reviewer: { name: "", url: `${SITE_URL}/editorial-policy` },
};

/** Person schema fragment (author / reviewer) for E-E-A-T. */
export function personSchema(p: { name: string; url?: string; sameAs?: string[] }) {
  return {
    "@type": "Person",
    name: p.name,
    ...(p.url ? { url: p.url } : {}),
    ...(p.sameAs?.length ? { sameAs: p.sameAs } : {}),
  };
}

/** Organization schema — establishes the brand entity (E-E-A-T). */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: PUBLISHER_LOGO,
    description: SITE_DESC,
    sameAs: SOCIAL_PROFILES,
  };
}

/** WebSite schema with a sitelinks search box (AEO / Google search action). */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/tools?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function faqSchema(faq: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** WebApplication schema for a calculator/tool. */
export function webAppSchema(tool: {
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  url?: string; // canonical path, e.g. "/calculators/loan-payoff-calculator"
  dateModified?: string; // ISO date — trust signal for YMYL
  author?: { name: string; url?: string; sameAs?: string[] };
  reviewer?: { name: string; url?: string; sameAs?: string[] };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title,
    url: abs(tool.url || `/tools/${tool.slug}`),
    description: tool.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    ...(tool.thumbnail ? { image: tool.thumbnail } : {}),
    ...(tool.dateModified ? { dateModified: tool.dateModified } : {}),
    ...(tool.author ? { author: personSchema(tool.author) } : {}),
    ...(tool.reviewer?.name ? { reviewer: personSchema(tool.reviewer) } : {}),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function articleSchema(a: {
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: { firstname?: string; lastname?: string };
}) {
  const authorName = a.author ? `${a.author.firstname ?? ""} ${a.author.lastname ?? ""}`.trim() : SITE_NAME;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    url: abs(`/blog/${a.slug}`),
    mainEntityOfPage: abs(`/blog/${a.slug}`),
    ...(a.featuredImage ? { image: a.featuredImage } : {}),
    datePublished: a.createdAt,
    dateModified: a.updatedAt || a.createdAt,
    author: { "@type": "Person", name: authorName || SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: PUBLISHER_LOGO },
    },
  };
}
