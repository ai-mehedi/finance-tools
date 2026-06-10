import SearchAutocomplete from "./SearchAutocomplete";

const TRUST = [
  { title: "100% Free", sub: "No Sign Up Required", icon: "check" },
  { title: "Accurate Results", sub: "Trusted Calculations", icon: "target" },
  { title: "Privacy First", sub: "Your Data is Safe", icon: "shield" },
  { title: "Mobile Friendly", sub: "Works on All Devices", icon: "phone" },
] as const;

function TrustIcon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "check":
      return (
        <svg {...common}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <path d="M11 18h2" />
        </svg>
      );
  }
}

function SnapshotCard() {
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Your Financial Snapshot</h3>
        <button className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600">
          This Month
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      <p className="mt-4 text-xs text-zinc-500">Total Balance</p>
      <span className="text-2xl font-extrabold tracking-tight text-zinc-900">$ 24,850.50</span>
      <span className="mt-1 flex w-fit items-center gap-1 text-xs font-semibold text-emerald-600">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 15 6-6 6 6" />
        </svg>
        12.5% vs last month
      </span>

      {/* Chart */}
      <div className="relative mt-3">
        <svg viewBox="0 0 300 110" className="w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="snapshotArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,85 L37,75 L75,88 L112,55 L150,66 L187,40 L225,52 L262,30 L300,15 L300,110 L0,110 Z"
            fill="url(#snapshotArea)"
          />
          <path
            d="M0,85 L37,75 L75,88 L112,55 L150,66 L187,40 L225,52 L262,30 L300,15"
            fill="none"
            stroke="#f97316"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
        <span>1 Sep</span>
        <span>8 Sep</span>
        <span>15 Sep</span>
        <span>22 Sep</span>
        <span>29 Sep</span>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4">
        {[
          { label: "Income", value: "$6,250", color: "text-emerald-600" },
          { label: "Expenses", value: "$3,210", color: "text-rose-500" },
          { label: "Savings", value: "$1,850", color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-[11px] text-zinc-500">{s.label}</p>
            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetCard() {
  const pct = 78;
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-zinc-900">Monthly Budget</h3>

      <div className="mt-4 flex items-center justify-center">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f1f3" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="#f97316"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-zinc-900">{pct}%</span>
            <span className="text-[11px] text-zinc-500">of $6,000</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-zinc-600">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Spent
          </span>
          <span className="font-bold text-zinc-900">$4,680</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-zinc-600">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" /> Remaining
          </span>
          <span className="font-bold text-zinc-900">$1,320</span>
        </div>
      </div>

      <button className="mt-4 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600">
        Create Budget
      </button>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Decorative AI-generated hero illustration (public/hero.webp) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero.webp"
        alt=""
        aria-hidden="true" loading="lazy" decoding="async"
        className="pointer-events-none absolute -right-16 bottom-0 hidden w-[560px] opacity-10 lg:block"
      />
      <div className="relative mx-auto grid container items-center gap-12 px-6 py-14 lg:grid-cols-2 lg:py-20">
        {/* Left */}
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-orange-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 6.9L21 9.2l-5.2 4.2L17.6 21 12 16.9 6.4 21l1.8-7.6L3 9.2l6.6-.3L12 2z" />
            </svg>
            100% Free Financial Tools
          </span>

          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 sm:text-5xl">
            All-in-One Financial Tools
            <br />
            <span className="text-orange-500">for Smarter Money Decisions</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-500">
            Calculate, plan &amp; achieve your financial goals with 200+ free
            tools, calculators and expert guides. Simple, fast and accurate.
          </p>

          {/* Search with live autocomplete */}
          <div className="mt-7">
            <SearchAutocomplete />
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
            {TRUST.map((t) => (
              <div key={t.title} className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                  <TrustIcon name={t.icon} />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-zinc-900">{t.title}</p>
                  <p className="text-xs text-zinc-500">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (hidden on mobile, shown from lg up) */}
        <div className="hidden gap-4 sm:grid-cols-[1.4fr_1fr] lg:grid">
          <SnapshotCard />
          <BudgetCard />
        </div>
      </div>
    </section>
  );
}
