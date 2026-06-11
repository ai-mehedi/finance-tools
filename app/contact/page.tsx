import Link from "next/link";
import { Bug, Lightbulb, Handshake, Mail } from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import Footer from "../components/Footer";
import ContactForm from "../components/ContactForm";
import { openGraphFor } from "@/lib/seo";

export const metadata = {
  title: "Contact Us",
  alternates: { canonical: "/contact" },
  openGraph: openGraphFor({ path: "/contact", title: "Contact Us | TopicDrill", description: "Questions, feedback, a wrong number in a calculator, or a partnership idea. Send us a message." }),
  description: "Questions, feedback, a wrong number in a calculator, or a partnership idea. Send us a message.",
};

const REASONS = [
  { Icon: Bug, title: "Spotted a problem", desc: "A calculator result looks off or a page is broken." },
  { Icon: Lightbulb, title: "Tool requests", desc: "There is a calculator you wish we had." },
  { Icon: Handshake, title: "Partnerships", desc: "Press, content or collaboration enquiries." },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto container px-6 py-10 sm:py-12">
            <nav className="flex items-center gap-2 text-sm text-zinc-400">
              <Link href="/" className="hover:text-orange-600">Home</Link><span>/</span><span className="font-medium text-zinc-600">Contact</span>
            </nav>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Get in touch</h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-zinc-500">
              Found a bug, want a new calculator, or just have a question? Drop us a line and a real person will read it.
            </p>
          </div>
        </div>

        <div className="mx-auto container grid gap-10 px-6 py-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
              <ContactForm />
            </div>
          </div>

          <aside className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6">
              <h2 className="text-base font-bold text-zinc-900">What can we help with?</h2>
              <ul className="mt-4 space-y-4">
                {REASONS.map((r) => (
                  <li key={r.title} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500 shadow-sm">
                      <r.Icon className="size-[18px]" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{r.title}</p>
                      <p className="text-sm text-zinc-500">{r.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500"><Mail className="size-[18px]" /></span>
              <p className="mt-3 text-sm text-zinc-500">Prefer email?</p>
              <a href="mailto:support@topicdrill.com" className="mt-1 block text-base font-bold text-orange-600 hover:underline">support@topicdrill.com</a>
              <p className="mt-3 text-xs text-zinc-400">We usually reply within one to two business days.</p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
