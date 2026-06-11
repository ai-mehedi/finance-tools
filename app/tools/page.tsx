import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import ToolCard from "../components/ToolCard";
import { getTools } from "@/lib/queries";
import { openGraphFor } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = {
  title: "All Tools & Calculators",
  // /tools and /calculators list almost the same set (nearly everything is a
  // calculator), so consolidate ranking signals onto the keyword-rich
  // /calculators URL instead of competing with ourselves.
  alternates: { canonical: "/calculators" },
  openGraph: openGraphFor({ path: "/calculators", title: "All Tools & Calculators | TopicDrill", description: "Browse 200+ free financial calculators and tools for loans, mortgage, investing, taxes, savings and more." }),
  description: "Browse 200+ free financial calculators and tools for loans, mortgage, investing, taxes, savings and more.",
};

const PER_PAGE = 24;

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const page = Math.max(1, Number(sp.page) || 1);
  const { data, total, pages } = await getTools({ q, page, limit: PER_PAGE });

  const buildHref = (p: number) => `/tools?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <SiteHeader active="Tools" />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-orange-100 via-orange-50 to-amber-50">
          <div className="mx-auto container px-6 py-12">
            <nav className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
              <Link href="/" className="hover:text-orange-600">Home</Link><span>/</span><span className="font-medium text-zinc-800">Tools</span>
            </nav>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              {q ? <>Results for &ldquo;{q}&rdquo;</> : <>All Tools &amp; <span className="text-orange-500">Calculators</span></>}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-zinc-600">{total} free financial tools to plan, calculate and grow your money.</p>
            <form action="/tools" className="mt-6 flex max-w-md gap-2">
              <input name="q" defaultValue={q} placeholder="Search tools…" className="h-11 flex-1 rounded-lg border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-orange-400" />
              <button className="rounded-lg bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-600">Search</button>
            </form>
          </div>
        </div>

        <div className="mx-auto container px-6 py-10">
          <AdSlot className="mb-8" />
          {data.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.map((tool) => (
                <ToolCard key={tool._id} tool={tool} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center text-sm text-zinc-400">No tools found.</p>
          )}

          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm">
              {page > 1 && <Link href={buildHref(page - 1)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-semibold text-zinc-700 hover:bg-zinc-50">Prev</Link>}
              <span className="px-2 text-zinc-500">Page {page} of {pages}</span>
              {page < pages && <Link href={buildHref(page + 1)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-semibold text-zinc-700 hover:bg-zinc-50">Next</Link>}
            </div>
          )}
          <AdSlot className="mt-10" />
        </div>
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
