// IndexNow — instantly notify Bing, Yandex and other participating engines when a
// URL is added or updated. The key is public by design (it is hosted at
// /<key>.txt), so there is no secret to protect here.
//
// Verification file: public/50eeb097afb4434d2ca86a1fce313756.txt (must contain the
// same key). If you rotate the key, rename that file to match.

export const INDEXNOW_KEY = "50eeb097afb4434d2ca86a1fce313756";

const HOST = (process.env.NEXT_PUBLIC_SITE_URL || "https://topicdrill.com")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");
const ORIGIN = `https://${HOST}`;

function toAbsolute(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${ORIGIN}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

/**
 * Submit one or more URLs (absolute or site-relative paths) to IndexNow.
 *
 * Best-effort by design: it never throws and never blocks a content save if the
 * ping fails, and it is a no-op outside production so we don't submit localhost
 * or preview-deployment URLs (which would point engines at the wrong host).
 */
export async function pingIndexNow(pathsOrUrls: string[]): Promise<void> {
  try {
    if (process.env.NODE_ENV !== "production") return;
    const urlList = [...new Set(pathsOrUrls.filter(Boolean))].map(toAbsolute);
    if (!urlList.length) return;

    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${ORIGIN}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
  } catch {
    // Submitting to IndexNow must never break content management. Swallow errors.
  }
}
