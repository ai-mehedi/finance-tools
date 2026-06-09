import Link from "next/link";
import { getFooterNav } from "@/lib/queries";

const SOCIAL = [
  { name: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
  { name: "Twitter", path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
  { name: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" },
];

export default async function Footer() {
  const columns = await getFooterNav();

  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-100">
      <div className="mx-auto container px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">📊</span>
              <span className="text-lg font-extrabold tracking-tight text-zinc-900">
                Topic<span className="text-orange-500">Drill</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
              Your all-in-one platform for financial tools, calculators, guides
              and expert tips. Plan smart, save more and achieve financial freedom.
            </p>
            <div className="mt-4 flex gap-3">
              {SOCIAL.map((s) => (
                <a key={s.name} href="#" aria-label={s.name} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-600 shadow-sm transition-colors hover:bg-orange-500 hover:text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.path} /></svg>
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col._id}>
              <h3 className="text-sm font-bold text-zinc-900">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.children.map((link) => (
                  <li key={link._id}>
                    <Link href={link.url || "#"} className="text-sm text-zinc-500 transition-colors hover:text-orange-500">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 text-sm text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} TopicDrill. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="transition-colors hover:text-orange-500">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-orange-500">Terms of Use</Link>
            <Link href="/disclaimer" className="transition-colors hover:text-orange-500">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
