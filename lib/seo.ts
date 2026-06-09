export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://topicdrill.com").replace(/\/$/, "");
export const SITE_NAME = "TopicDrill";
export const SITE_DESC =
  "Free, fast financial calculators and clear money guides. No sign-ups, no clutter.";
export const PUBLISHER_LOGO = `${SITE_URL}/hero.webp`;

export const abs = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

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
    sameAs: [] as string[],
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title,
    url: abs(`/tools/${tool.slug}`),
    description: tool.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    ...(tool.thumbnail ? { image: tool.thumbnail } : {}),
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
