const BADGE_COLORS: Record<string, string> = {
  BUDGETING: "bg-orange-500",
  SAVING: "bg-emerald-500",
  LOANS: "bg-blue-500",
  INVESTING: "bg-teal-500",
  TAXES: "bg-amber-500",
};

const FEATURED = {
  badge: "BUDGETING",
  title: "How to Create a Monthly Budget That Works",
  desc: "A step-by-step guide to creating a realistic budget, tracking your expenses and sticking to your financial goals.",
  author: "Emily Watson",
  date: "May 20, 2024",
  read: "8 min read",
  art: "from-amber-100 to-orange-200",
  emoji: "📒",
};

const ARTICLES = [
  { badge: "SAVING", title: "10 Best Savings Tips to Build Emergency Fund Faster", desc: "Learn practical ways to save more money and build an emergency fund for a secure future.", author: "Michael Lee", date: "May 18, 2024", read: "6 min read", art: "from-emerald-100 to-green-200", emoji: "🌱" },
  { badge: "LOANS", title: "Home Loan vs Personal Loan: Which is Better?", desc: "Compare home loan and personal loan features, interest rates, eligibility and benefits to make the right choice.", author: "Sarah Johnson", date: "May 16, 2024", read: "7 min read", art: "from-sky-100 to-blue-200", emoji: "🏠" },
  { badge: "INVESTING", title: "Beginner's Guide to Investing in Stocks", desc: "Understand the basics of stock market investing, types of investments and how to get started.", author: "David Brown", date: "May 14, 2024", read: "8 min read", art: "from-zinc-700 to-zinc-900", emoji: "📈" },
  { badge: "SAVING", title: "Top 10 Ways to Save Money in 2024", desc: "Simple and effective tips to cut unnecessary expenses and save more money every month.", author: "Jessica Miller", date: "May 12, 2024", read: "5 min read", art: "from-pink-100 to-rose-200", emoji: "🐷" },
  { badge: "TAXES", title: "Income Tax Slabs FY 2024-25: New Regime vs Old Regime", desc: "Detailed comparison of new and old tax regimes to help you save more on taxes.", author: "Robert Wilson", date: "May 10, 2024", read: "6 min read", art: "from-amber-100 to-yellow-200", emoji: "🧾" },
];

const CATEGORIES = [
  { name: "Budgeting", count: 24, emoji: "📅" },
  { name: "Saving", count: 18, emoji: "💵" },
  { name: "Investing", count: 22, emoji: "📈" },
  { name: "Loans", count: 16, emoji: "🤝" },
  { name: "Retirement", count: 14, emoji: "🧓" },
  { name: "Taxes", count: 12, emoji: "💰" },
  { name: "Insurance", count: 10, emoji: "🛡️" },
  { name: "Personal Finance", count: 20, emoji: "💼" },
];

const POPULAR = [
  { title: "50/30/20 Budget Rule Explained with Examples", art: "from-amber-100 to-orange-200", emoji: "🥧" },
  { title: "Best Investment Options in India for 2024", art: "from-sky-100 to-blue-200", emoji: "📊" },
  { title: "How to Improve Your Credit Score Fast", art: "from-emerald-100 to-green-200", emoji: "🌱" },
  { title: "SIP vs Lump Sum Investment: Which is Better?", art: "from-violet-100 to-purple-200", emoji: "📈" },
];

const FEATURES = [
  { title: "Expert Writers", icon: "M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z M2 2l7.586 7.586 M11 11a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" },
  { title: "Actionable Tips", icon: "M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z" },
  { title: "Regular Updates", icon: "M21 12a9 9 0 1 1-3-6.7L21 8 M21 3v5h-5" },
  { title: "100% Free Content", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z M9 12l2 2 4-4" },
];

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide text-white ${BADGE_COLORS[label] ?? "bg-zinc-500"}`}>
      {label}
    </span>
  );
}

function Meta({ author, date, read }: { author: string; date: string; read: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
        {author.split(" ").map((n) => n[0]).join("")}
      </span>
      <span className="font-medium text-zinc-700">{author}</span>
      <span className="text-zinc-300">•</span>
      <span>{date}</span>
      <span className="text-zinc-300">•</span>
      <span>{read}</span>
    </div>
  );
}

export default function Blog() {
  return (
    <>
      {/* Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-100 via-orange-50 to-amber-50">
        <div className="relative mx-auto container px-6 py-12">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <nav className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
                <a href="/" className="hover:text-orange-600">Home</a>
                <span>›</span>
                <span className="font-medium text-zinc-800">Blog</span>
              </nav>
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
                Finance Blog
              </h1>
              <p className="mt-4 max-w-xl text-base text-zinc-600">
                Expert insights, practical tips and in-depth guides to help you
                make smarter financial decisions and achieve your money goals.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
                {FEATURES.map((f) => (
                  <div key={f.title} className="flex flex-col items-center gap-1.5 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={f.icon} />
                      </svg>
                    </span>
                    <span className="text-xs font-semibold text-zinc-700">{f.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Illustration */}
            <div className="relative hidden h-64 lg:block">
              <span className="absolute left-2 top-16 text-6xl">☕</span>
              <div className="absolute left-1/4 top-4 w-72 rotate-1 rounded-t-xl border-4 border-zinc-300 bg-white p-3 shadow-xl">
                <p className="text-xs font-bold text-zinc-700">BLOG</p>
                <div className="mt-2 flex gap-2">
                  <span className="flex h-12 w-16 items-center justify-center rounded bg-gradient-to-br from-amber-200 to-orange-300 text-lg">🖼️</span>
                  <div className="flex-1 space-y-1.5 pt-1">
                    <span className="block h-1.5 w-full rounded bg-zinc-200" />
                    <span className="block h-1.5 w-5/6 rounded bg-zinc-200" />
                    <span className="block h-1.5 w-2/3 rounded bg-zinc-200" />
                  </div>
                </div>
              </div>
              <span className="absolute right-2 top-6 text-6xl">🪴</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto container px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Articles */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-extrabold text-zinc-900">Latest Articles</h2>

            {/* Featured */}
            <a href="#" className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-md">
              <div className="grid sm:grid-cols-2">
                <div className={`flex h-56 items-center justify-center bg-gradient-to-br text-6xl sm:h-full ${FEATURED.art}`}>
                  {FEATURED.emoji}
                </div>
                <div className="flex flex-col justify-center p-6">
                  <Badge label={FEATURED.badge} />
                  <h3 className="mt-3 text-xl font-extrabold leading-snug text-zinc-900 group-hover:text-orange-600">
                    {FEATURED.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{FEATURED.desc}</p>
                  <div className="mt-4">
                    <Meta author={FEATURED.author} date={FEATURED.date} read={FEATURED.read} />
                  </div>
                </div>
              </div>
            </a>

            {/* List */}
            <div className="mt-6 space-y-4">
              {ARTICLES.map((a) => (
                <a key={a.title} href="#" className="group flex gap-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md">
                  <div className={`flex h-28 w-36 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-4xl ${a.art}`}>
                    {a.emoji}
                  </div>
                  <div className="flex flex-col justify-center">
                    <Badge label={a.badge} />
                    <h3 className="mt-2 text-base font-bold leading-snug text-zinc-900 group-hover:text-orange-600">
                      {a.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{a.desc}</p>
                    <div className="mt-2">
                      <Meta author={a.author} date={a.date} read={a.read} />
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-2">
              {["1", "2", "3", "4", "…", "12"].map((p, i) => (
                <button
                  key={`${p}-${i}`}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors ${
                    p === "1" ? "bg-orange-500 text-white" : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  } ${p === "…" ? "pointer-events-none border-0" : ""}`}
                >
                  {p}
                </button>
              ))}
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                <ArrowRight />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="search"
                  placeholder="Search blog articles..."
                  className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-orange-400"
                />
              </div>
              <button className="rounded-lg bg-orange-500 px-4 text-sm font-bold text-white transition-colors hover:bg-orange-600">
                Search
              </button>
            </div>

            {/* Categories */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h3 className="mb-3 text-base font-extrabold text-zinc-900">Categories</h3>
              <ul>
                {CATEGORIES.map((c) => (
                  <li key={c.name}>
                    <a href="#" className="flex items-center justify-between border-b border-zinc-100 py-2.5 text-sm transition-colors last:border-0 hover:text-orange-600">
                      <span className="flex items-center gap-2 text-zinc-700">
                        <span>{c.emoji}</span> {c.name}
                      </span>
                      <span className="text-zinc-400">{c.count}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <a href="/categories" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-600">
                View All Categories <ArrowRight />
              </a>
            </div>

            {/* Popular Articles */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h3 className="mb-4 text-base font-extrabold text-zinc-900">Popular Articles</h3>
              <ul className="space-y-4">
                {POPULAR.map((p) => (
                  <li key={p.title}>
                    <a href="#" className="group flex items-center gap-3">
                      <span className={`flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xl ${p.art}`}>
                        {p.emoji}
                      </span>
                      <span className="text-sm font-semibold leading-snug text-zinc-800 group-hover:text-orange-600">
                        {p.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <a href="#" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-600">
                View All Popular Articles <ArrowRight />
              </a>
            </div>

            {/* Newsletter */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h3 className="text-base font-extrabold text-zinc-900">Subscribe to Newsletter</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Get the latest financial tips, tools and guides straight to your inbox.
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-11 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-orange-400"
                />
                <button className="rounded-lg bg-orange-500 px-4 text-sm font-bold text-white transition-colors hover:bg-orange-600">
                  Subscribe
                </button>
              </div>
              <p className="mt-2 text-xs text-zinc-400">No spam. Unsubscribe anytime.</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
