import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "./components/SiteHeader";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "Sorry, the page you are looking for does not exist. Browse our free financial calculators and money guides instead.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto container px-6 py-20 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-orange-500">404 Error</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            This page does not exist
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-600">
            Sorry, we couldn&apos;t find the page you were looking for. It may have been
            moved or removed. Try one of the links below to get back on track.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600"
            >
              Return Home
            </Link>
            <Link
              href="/calculators"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-bold text-zinc-800 transition-colors hover:border-orange-200 hover:text-orange-600"
            >
              Browse All Calculators
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-bold text-zinc-800 transition-colors hover:border-orange-200 hover:text-orange-600"
            >
              Browse Categories
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
