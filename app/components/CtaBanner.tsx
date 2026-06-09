export default function CtaBanner() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto container px-6 pt-4 pb-2">
        <div className="flex flex-col items-center gap-6 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-100 to-orange-50 px-6 py-7 sm:px-10 md:flex-row md:justify-between">
          <div className="flex items-center gap-5">
            {/* Illustration */}
            <div className="relative hidden h-20 w-24 shrink-0 sm:block">
              <span className="absolute left-2 top-1 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-600 to-zinc-800 text-2xl shadow-md">
                🔐
              </span>
              <span className="absolute bottom-0 left-0 text-xl">🪙</span>
              <span className="absolute -bottom-0.5 right-1 text-2xl">🛡️</span>
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 sm:text-2xl">
                Financial Freedom Begins with the Right Tools
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-zinc-600">
                Make smarter decisions, save more and build wealth with our
                expert financial tools and guides.
              </p>
            </div>
          </div>

          <button className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600">
            Explore All Tools
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
