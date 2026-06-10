import Link from "next/link";

export type Post = {
  slug: string;
  badge: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  read: string;
};

const TOC = [
  "Calculate Your Total Monthly Income",
  "Track Your Expenses",
  "Use the 50/30/20 Rule",
  "Set Savings Goals",
  "Review and Adjust",
];

const RELATED_CALCS = [
  { title: "Budget Calculator", sub: "Plan your monthly budget", icon: "🧮", tile: "bg-orange-100" },
  { title: "Savings Calculator", sub: "Calculate your savings growth", icon: "🐷", tile: "bg-emerald-100" },
  { title: "EMI Calculator", sub: "Calculate your loan EMI", icon: "🏦", tile: "bg-amber-100" },
  { title: "Interest Calculator", sub: "Calculate simple & compound interest", icon: "📈", tile: "bg-blue-100" },
  { title: "Debt Payoff Calculator", sub: "Plan and pay off your debt faster", icon: "📝", tile: "bg-violet-100" },
];

const POPULAR = [
  { title: "10 Best Savings Tips to Build Emergency Fund Faster", date: "May 18, 2024", read: "6 min read", art: "from-emerald-100 to-green-200", emoji: "🌱" },
  { title: "50/30/20 Budget Rule Explained", date: "May 15, 2024", read: "7 min read", art: "from-amber-100 to-orange-200", emoji: "🥧" },
  { title: "10 Best Budgeting Apps for 2024", date: "May 12, 2024", read: "5 min read", art: "from-sky-100 to-blue-200", emoji: "📱" },
  { title: "How to Improve Your Credit Score Fast", date: "May 10, 2024", read: "8 min read", art: "from-rose-100 to-pink-200", emoji: "💳" },
  { title: "SIP vs Lump Sum Investment: Which is Better?", date: "May 8, 2024", read: "6 min read", art: "from-violet-100 to-purple-200", emoji: "📊" },
];

const ALSO_LIKE = [
  { badge: "SAVING", color: "bg-emerald-500", title: "Top 10 Ways to Save Money Every Month", date: "May 12, 2024", read: "5 min read", art: "from-pink-100 to-rose-200", emoji: "🐷" },
  { badge: "INVESTING", color: "bg-teal-500", title: "Beginner's Guide to Investing in Stocks", date: "May 14, 2024", read: "8 min read", art: "from-zinc-700 to-zinc-900", emoji: "📈" },
  { badge: "LOANS", color: "bg-blue-500", title: "Home Loan vs Personal Loan: Which is Better?", date: "May 16, 2024", read: "7 min read", art: "from-sky-100 to-blue-200", emoji: "🏠" },
  { badge: "TAXES", color: "bg-amber-500", title: "Income Tax Slabs FY 2024-25: New Regime vs Old Regime", date: "May 10, 2024", read: "6 min read", art: "from-amber-100 to-yellow-200", emoji: "🧾" },
];

const SHARE = [
  { name: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
  { name: "Twitter", path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
  { name: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" },
  { name: "Copy", path: "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1 M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" },
];

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function BlogDetail({ post }: { post: Post }) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-zinc-100 bg-white">
        <nav className="mx-auto container flex flex-wrap items-center gap-2 px-6 py-3 text-sm text-zinc-500">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          <span>›</span>
          <Link href="/blog" className="hover:text-orange-600">Blog</Link>
          <span>›</span>
          <a href={`/categories/${post.category.toLowerCase()}`} className="hover:text-orange-600">{post.category}</a>
          <span>›</span>
          <span className="truncate font-medium text-zinc-800">{post.title}</span>
        </nav>
      </div>

      <div className="mx-auto container px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Article */}
          <article className="lg:col-span-2">
            <span className="inline-block rounded-md bg-orange-100 px-2.5 py-1 text-xs font-bold tracking-wide text-orange-600">
              {post.badge}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-base text-zinc-500">{post.excerpt}</p>

            {/* Author + share */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-6">
              <div className="flex items-center gap-3 text-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                  {post.author.split(" ").map((n) => n[0]).join("")}
                </span>
                <span className="flex items-center gap-1 font-bold text-zinc-900">
                  {post.author}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f97316"><path d="m9 12 2 2 4-4 1.5 1.5L11 17l-3.5-3.5z M12 2l2.4 1.8 3-.2 1 2.8 2.8 1-.2 3L24 12l-1.8 2.4.2 3-2.8 1-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8-2.8-1 .2-3L0 12l1.8-2.4-.2-3 2.8-1 1-2.8 3 .2z" fillRule="evenodd" opacity="0" /></svg>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] text-white">✓</span>
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-500">{post.date}</span>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-500">{post.read}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">Share:</span>
                {SHARE.map((s) => (
                  <a key={s.name} href="#" aria-label={s.name} className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition-colors hover:bg-orange-500 hover:text-white">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.path} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Hero image */}
            <div className="mt-6 flex h-72 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 text-7xl">
              📒
            </div>

            {/* Body */}
            <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-zinc-600">
              <p>Creating a monthly budget is one of the most effective ways to take control of your finances. It helps you track your income, manage expenses and save more for your future goals.</p>
              <p>In this guide, we&apos;ll walk you through the steps to create a budget that actually works and is easy to stick with.</p>

              <h2 id="step-1" className="pt-2 text-lg font-bold text-zinc-900">1. Calculate Your Total Monthly Income</h2>
              <p>Start by calculating your total take-home income. Include your salary, freelance income, rental income or any other regular earnings.</p>
              <div className="flex items-start gap-2 rounded-xl bg-orange-50 p-4 text-sm text-zinc-700">
                <span className="text-orange-500">💡</span>
                <p><span className="font-semibold">Tip:</span> Use our <a href="#" className="font-semibold text-orange-600 hover:underline">Income Calculator</a> to get a detailed breakdown of your income.</p>
              </div>

              <h2 id="step-2" className="pt-2 text-lg font-bold text-zinc-900">2. Track Your Expenses</h2>
              <p>List all your monthly expenses. Divide them into two categories:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li><span className="font-semibold text-zinc-800">Fixed Expenses:</span> Rent, utilities, insurance, loan EMIs, subscriptions</li>
                <li><span className="font-semibold text-zinc-800">Variable Expenses:</span> Groceries, dining out, shopping, entertainment</li>
              </ul>

              <h2 id="step-3" className="pt-2 text-lg font-bold text-zinc-900">3. Use the 50/30/20 Rule</h2>
              <p>A simple and effective budgeting method:</p>
              <div className="flex flex-col items-center gap-6 rounded-xl bg-zinc-50 p-6 sm:flex-row">
                <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#f97316" strokeWidth="6" strokeDasharray="47.12 94.25" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray="28.27 94.25" strokeDashoffset="-47.12" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="18.85 94.25" strokeDashoffset="-75.39" />
                </svg>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-orange-500" /><span className="font-bold text-zinc-900">50%</span> Needs (Essentials)</li>
                  <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500" /><span className="font-bold text-zinc-900">30%</span> Wants (Lifestyle)</li>
                  <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /><span className="font-bold text-zinc-900">20%</span> Savings & Debt Repayment</li>
                </ul>
              </div>

              <h2 id="step-4" className="pt-2 text-lg font-bold text-zinc-900">4. Set Savings Goals</h2>
              <p>Automate your savings by transferring a fixed amount to your savings account every month. Even small amounts can create a big impact over time.</p>

              <h2 id="step-5" className="pt-2 text-lg font-bold text-zinc-900">5. Review and Adjust</h2>
              <p>Review your budget at the end of every month. Make adjustments, cut unnecessary expenses and stay on track.</p>

              <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-zinc-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">✓</span>
                <p><span className="font-bold text-zinc-900">Conclusion:</span> A budget is not about restricting yourself, it&apos;s about giving your money a purpose. Start small, stay consistent and enjoy the financial freedom you deserve.</p>
              </div>
            </div>

            {/* Helpful */}
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-zinc-100 pt-6">
              <span className="text-sm font-semibold text-zinc-700">Was this article helpful?</span>
              <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50">
                👍 Yes (128)
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50">
                👎 No (12)
              </button>
            </div>

            {/* You might also like */}
            <div className="mt-12">
              <h2 className="mb-5 text-xl font-extrabold text-zinc-900">You Might Also Like</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {ALSO_LIKE.map((a) => (
                  <a key={a.title} href="#" className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-md">
                    <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br text-4xl ${a.art}`}>
                      <span className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${a.color}`}>{a.badge}</span>
                      {a.emoji}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold leading-snug text-zinc-900 group-hover:text-orange-600">{a.title}</h3>
                      <p className="mt-2 text-xs text-zinc-400">{a.date} • {a.read}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* TOC */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h3 className="mb-3 text-base font-extrabold text-zinc-900">Table of Contents</h3>
              <ol className="space-y-2.5 text-sm">
                {TOC.map((t, i) => (
                  <li key={t}>
                    <a href={`#step-${i + 1}`} className="flex gap-2 text-zinc-600 transition-colors hover:text-orange-600">
                      <span className="font-semibold text-zinc-400">{i + 1}.</span>
                      {t}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            {/* Promo */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 p-6">
              <h3 className="text-lg font-extrabold leading-snug text-zinc-900">
                Plan Better. Save More. Achieve Your Goals.
              </h3>
              <p className="mt-2 max-w-[14rem] text-sm text-zinc-600">
                Use our budgeting tools to plan smarter and track your money easily.
              </p>
              <button className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600">
                Explore Budget Tools
              </button>
              <span className="absolute -bottom-1 right-3 text-5xl opacity-90">🛍️</span>
            </div>

            {/* Related calculators */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h3 className="mb-4 text-base font-extrabold text-zinc-900">Related Calculators</h3>
              <ul className="space-y-3">
                {RELATED_CALCS.map((c) => (
                  <li key={c.title}>
                    <a href="#" className="group flex items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${c.tile}`}>{c.icon}</span>
                      <span>
                        <span className="block text-sm font-bold text-zinc-900 group-hover:text-orange-600">{c.title}</span>
                        <span className="block text-xs text-zinc-500">{c.sub}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-orange-200 py-2.5 text-sm font-bold text-orange-600 transition-colors hover:bg-orange-50">
                View All Calculators <ArrowRight />
              </button>
            </div>

            {/* Popular articles */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h3 className="mb-4 text-base font-extrabold text-zinc-900">Popular Articles</h3>
              <ul className="space-y-4">
                {POPULAR.map((p) => (
                  <li key={p.title}>
                    <a href="#" className="group flex items-center gap-3">
                      <span className={`flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xl ${p.art}`}>{p.emoji}</span>
                      <span>
                        <span className="block text-sm font-semibold leading-snug text-zinc-800 group-hover:text-orange-600">{p.title}</span>
                        <span className="mt-1 block text-xs text-zinc-400">{p.date} • {p.read}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-orange-200 py-2.5 text-sm font-bold text-orange-600 transition-colors hover:bg-orange-50">
                View All Articles <ArrowRight />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
