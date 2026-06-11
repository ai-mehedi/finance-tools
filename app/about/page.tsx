import Link from "next/link";
import StaticPage, { H2, P } from "../components/StaticPage";
import { openGraphFor } from "@/lib/seo";

export const metadata = {
  title: "About Us",
  alternates: { canonical: "/about" },
  openGraph: openGraphFor({ path: "/about", title: "About Us | TopicDrill", description: "Who builds TopicDrill and why. Free, fast financial calculators with no sign-ups and no clutter." }),
  description: "Who builds TopicDrill and why. Free, fast financial calculators with no sign-ups and no clutter.",
};

const STATS = [
  { value: "200+", label: "Calculators" },
  { value: "17", label: "Categories" },
  { value: "100%", label: "Free to use" },
  { value: "0", label: "Sign-ups required" },
];

export default function AboutPage() {
  return (
    <StaticPage title="About TopicDrill" intro="Fast financial calculators and clear guides, with no sign-ups and no clutter.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 text-center">
            <p className="text-2xl font-extrabold text-orange-500">{s.value}</p>
            <p className="mt-1 text-xs font-medium text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <P>
          TopicDrill started from a small frustration. Most financial calculators online are buried under ads,
          locked behind a sign-up, or so cluttered that you give up before you get an answer. We wanted the
          opposite: open the page, type your numbers, get the result.
        </P>
        <P>
          The site now covers more than 200 calculators across loans, mortgages, investing, savings, taxes and
          retirement, with guides that explain what the numbers actually mean for your money.
        </P>

        <H2>What you get</H2>
        <ul className="mb-4 space-y-2 text-[15px] text-zinc-600">
          <li className="flex gap-2"><span className="text-orange-500">•</span> Every tool is free. No account, no paywall.</li>
          <li className="flex gap-2"><span className="text-orange-500">•</span> Calculations run in your browser, so the figures you type stay on your device.</li>
          <li className="flex gap-2"><span className="text-orange-500">•</span> Guides written and reviewed by real people, not auto-generated filler.</li>
          <li className="flex gap-2"><span className="text-orange-500">•</span> One job per tool, done well, so you are never hunting for the input you need.</li>
        </ul>

        <H2>How we keep it honest</H2>
        <P>
          We use standard, well-documented formulas and test them against known results. Tools are estimates, not
          advice, and we say so clearly. If a number ever looks wrong, tell us and we will fix it. Every page links
          back to our <Link href="/contact" className="font-semibold text-orange-600 hover:underline">contact form</Link>.
        </P>
      </div>
    </StaticPage>
  );
}
