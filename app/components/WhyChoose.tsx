const FEATURES = [
  { title: "Completely Free", desc: "All tools are 100% free forever.", icon: "tag" },
  { title: "Accurate & Reliable", desc: "Industry standard formulas and data.", icon: "check" },
  { title: "No Sign Up Needed", desc: "Use tools instantly, no registration.", icon: "bolt" },
  { title: "Secure & Private", desc: "We value your privacy and data security.", icon: "shield" },
  { title: "Updated Regularly", desc: "Tools & articles are updated frequently.", icon: "refresh" },
] as const;

function FeatureIcon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "tag":
      return (
        <svg {...common}>
          <path d="M3 7v5l9 9 7-7-9-9H4a1 1 0 0 0-1 1Z" />
          <circle cx="7.5" cy="7.5" r="1.5" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <rect x="9" y="11" width="6" height="5" rx="1" />
          <path d="M10 11V9a2 2 0 0 1 4 0v2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
      );
  }
}

export default function WhyChoose() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto container px-6 py-10">
        <h2 className="mb-8 text-center text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          Why Choose TopicDrill?
        </h2>

        <div className="grid grid-cols-1 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <FeatureIcon name={f.icon} />
              </span>
              <div className="leading-tight">
                <h3 className="text-sm font-bold text-zinc-900">{f.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
