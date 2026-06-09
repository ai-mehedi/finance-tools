const BADGES = [
  { title: "100% Free", sub: "No hidden charges", icon: "M20 6 9 17l-5-5" },
  { title: "Accurate Results", sub: "Trusted calculations", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z M9 12l2 2 4-4" },
  { title: "No Sign Up", sub: "Use tools instantly", icon: "M13 2 3 14h9l-1 8 10-12h-9l1-8Z" },
  { title: "Secure & Private", sub: "Your data is safe", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" },
  { title: "Mobile Friendly", sub: "Works everywhere", icon: "M7 2h10v20H7z M11 18h2" },
];

export default function TrustBadges() {
  return (
    <section className="w-full bg-orange-50/60">
      <div className="mx-auto container px-6 py-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {BADGES.map((b) => (
            <div key={b.title} className="flex items-center justify-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={b.icon} />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-zinc-900">{b.title}</p>
                <p className="text-xs text-zinc-500">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
