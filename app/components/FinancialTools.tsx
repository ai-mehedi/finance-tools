import Link from "next/link";
import type { ToolLite } from "@/lib/queries";

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function FinancialTools({ tools }: { tools: ToolLite[] }) {
  if (!tools.length) return null;
  return (
    <section className="w-full bg-zinc-50">
      <div className="mx-auto container px-6 py-14">
        <div className="relative mb-10 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">Popular Financial Tools</h2>
          <p className="mt-2 text-sm text-zinc-500">Most used calculators and tools by our users</p>
          <Link href="/tools" className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100 lg:absolute lg:right-0 lg:top-0 lg:mt-0">
            View All Tools <Arrow />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {tools.map((tool) => (
            <Link key={tool._id} href={`/tools/${tool.slug}`} className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-orange-50/70 text-3xl">
                {tool.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tool.thumbnail} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-contain p-1" />
                ) : (
                  "🧮"
                )}
              </span>
              <h3 className="mt-4 text-base font-bold text-zinc-900">{tool.title}</h3>
              <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-500">{tool.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-orange-500">
                Use Tool <Arrow className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
