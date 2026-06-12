import type { Metadata } from "next";
import { getToolBySlug } from "./queries";

/**
 * Merge DB-managed SEO (metaTitle / metaDescription / keywords / ogImage) over a
 * page's hardcoded fallback metadata. Calculator pages call this from their
 * `generateMetadata` so SEO can be tuned in the DB without code changes. The DB
 * round-trip is already paid for (pages fetch the tool for the icon anyway) and
 * `fetch`/query results are memoized within a render.
 */
export async function toolMetadata(slug: string, base: Metadata): Promise<Metadata> {
  const self = (await getToolBySlug(slug).catch(() => null)) as
    | { metaTitle?: string; metaDescription?: string; keywords?: string[]; ogImage?: string }
    | null;
  if (!self) return base;

  const title = self.metaTitle?.trim() || (base.title as string | undefined);
  const description = self.metaDescription?.trim() || base.description || undefined;
  const keywords = self.keywords?.length ? self.keywords : base.keywords;
  const ogImage = self.ogImage;

  const ogBase = (base.openGraph ?? {}) as Record<string, unknown>;
  const twBase = (base.twitter ?? {}) as Record<string, unknown>;
  const social = title ? `${title} | TopicDrill` : undefined;

  return {
    ...base,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(keywords ? { keywords } : {}),
    openGraph: {
      ...ogBase,
      ...(social ? { title: social } : {}),
      ...(description ? { description } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      ...twBase,
      ...(social ? { title: social } : {}),
      ...(description ? { description } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
