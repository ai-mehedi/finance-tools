import Link from "next/link";
import type { ToolLite } from "@/lib/queries";
import ToolCard from "./ToolCard";

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
            <ToolCard key={tool._id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
