import Link from "next/link";
import StaticPage from "../components/StaticPage";
import { getTools } from "@/lib/queries";

export const revalidate = 3600;
export const metadata = { title: "Calculators", description: "Free online financial calculators for loans, savings, investing, taxes and more.", alternates: { canonical: "/calculators" } };

const PER_PAGE = 24;

export default async function CalculatorsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { data, total, pages } = await getTools({ type: "calculator", page, limit: PER_PAGE });

  return (
    <StaticPage title="Calculators" intro={`${total} free financial calculators to run the numbers in seconds.`} active="Calculators">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((tool) => (
          <Link key={tool._id} href={`/tools/${tool.slug}`} className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-orange-50/70 text-2xl">
              {tool.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tool.thumbnail} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-contain p-1" />
              ) : ("🧮")}
            </span>
            <h3 className="mt-4 text-sm font-bold text-zinc-900 group-hover:text-orange-600">{tool.title}</h3>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{tool.description}</p>
          </Link>
        ))}
      </div>
      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm">
          {page > 1 && <Link href={`/calculators?page=${page - 1}`} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-semibold text-zinc-700 hover:bg-zinc-50">Prev</Link>}
          <span className="px-2 text-zinc-500">Page {page} of {pages}</span>
          {page < pages && <Link href={`/calculators?page=${page + 1}`} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-semibold text-zinc-700 hover:bg-zinc-50">Next</Link>}
        </div>
      )}
    </StaticPage>
  );
}
