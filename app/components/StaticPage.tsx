import Link from "next/link";
import SiteHeader from "./SiteHeader";
import Footer from "./Footer";
import CalcActions from "./CalcActions";
import { EDITORIAL, LAST_REVIEWED } from "@/lib/seo";

export default function StaticPage({
  title,
  intro,
  updated,
  active,
  wide = false,
  icon,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  active?: string;
  wide?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  // Calculator pages get an automatic E-E-A-T byline (YMYL trust signal): who is
  // accountable and when it was reviewed. Legal/info pages keep the plain pill.
  const isCalc = active === "Calculators";
  const reviewedOn = updated || LAST_REVIEWED;
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader active={active} />
      <main className="flex-1">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto container px-6 py-10 sm:py-12">
            <nav className="flex items-center gap-2 text-sm text-zinc-400">
              <Link href="/" className="hover:text-orange-600">Home</Link>
              <span>/</span>
              <span className="font-medium text-zinc-600">{title}</span>
            </nav>
            <div className="mt-4 flex items-center gap-4">
              {icon && (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-50 text-3xl">
                  {icon}
                </span>
              )}
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">{title}</h1>
            </div>
            {intro && <p className="mt-3 max-w-2xl text-lg leading-relaxed text-zinc-500">{intro}</p>}
            {isCalc ? (
              <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                <span>
                  Written by{" "}
                  <Link href={EDITORIAL.author.url} className="font-semibold text-zinc-700 hover:text-orange-600">
                    {EDITORIAL.author.name}
                  </Link>
                </span>
                {EDITORIAL.reviewer.name && (
                  <>
                    <span className="text-zinc-300">·</span>
                    <span>
                      Reviewed by{" "}
                      <Link href={EDITORIAL.reviewer.url} className="font-semibold text-zinc-700 hover:text-orange-600">
                        {EDITORIAL.reviewer.name}
                      </Link>
                    </span>
                  </>
                )}
                <span className="text-zinc-300">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Updated {reviewedOn}
                </span>
              </p>
            ) : (
              updated && (
                <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Last updated {updated}
                </p>
              )
            )}
            {isCalc && <CalcActions title={title} />}
          </div>
        </div>
        <div className="mx-auto container px-6 py-12">
          <div className={wide ? "" : "mx-auto max-w-3xl"}>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Shared section heading + paragraph styles for legal/content pages. */
export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 mb-3 text-xl font-bold text-zinc-900 first:mt-0">{children}</h2>;
}
export function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[15px] leading-7 text-zinc-600">{children}</p>;
}
