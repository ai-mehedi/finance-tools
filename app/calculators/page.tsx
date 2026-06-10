import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import ToolCard from "../components/ToolCard";
import { getTools } from "@/lib/queries";

export const revalidate = 3600;
export const metadata = {
  title: "Calculators",
  description: "Free online financial calculators for loans, savings, investing, taxes and more.",
  alternates: { canonical: "/calculators" },
};

const PER_PAGE = 24;

export default async function CalculatorsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { data, total, pages } = await getTools({ type: "calculator", page, limit: PER_PAGE });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <SiteHeader active="Calculators" />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-orange-100 via-orange-50 to-amber-50">
          <div className="mx-auto container px-6 py-12">
            <nav className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
              <Link href="/" className="hover:text-orange-600">Home</Link><span>/</span><span className="font-medium text-zinc-800">Calculators</span>
            </nav>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Financial <span className="text-orange-500">Calculators</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base text-zinc-600">{total} free financial calculators to run the numbers in seconds.</p>
          </div>
        </div>

        <div className="mx-auto container px-6 py-10">
          {data.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.map((tool) => (
                <ToolCard key={tool._id} tool={tool} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center text-sm text-zinc-400">No calculators found.</p>
          )}

          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm">
              {page > 1 && <Link href={`/calculators?page=${page - 1}`} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-semibold text-zinc-700 hover:bg-zinc-50">Prev</Link>}
              <span className="px-2 text-zinc-500">Page {page} of {pages}</span>
              {page < pages && <Link href={`/calculators?page=${page + 1}`} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-semibold text-zinc-700 hover:bg-zinc-50">Next</Link>}
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
