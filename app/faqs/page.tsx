import StaticPage from "../components/StaticPage";

export const metadata = { title: "FAQs", description: "Frequently asked questions about TopicDrill's free financial tools.", alternates: { canonical: "/faqs" } };

const FAQS = [
  { q: "Are the tools really free?", a: "Yes. Every calculator and tool on TopicDrill is 100% free with no sign-up required." },
  { q: "Do I need to create an account?", a: "No account is needed to use any calculator. Accounts are only used by our content team." },
  { q: "Is my data safe?", a: "Most calculators run entirely in your browser, so the numbers you enter are never sent to our servers." },
  { q: "How accurate are the calculators?", a: "We use standard financial formulas, but results are estimates. Always verify important figures and consult a professional." },
  { q: "Do the tools work for my country?", a: "Universal tools (loans, mortgage, compound interest, percentages) work anywhere. Some tax and retirement tools are region-specific." },
  { q: "Can I suggest a new tool?", a: "Absolutely — send us your idea via the contact page and we'll consider adding it." },
];

export default function FaqsPage() {
  return (
    <StaticPage title="Frequently Asked Questions" intro="Answers to the most common questions about TopicDrill.">
      <div className="max-w-3xl space-y-3">
        {FAQS.map((f) => (
          <details key={f.q} className="group rounded-xl border border-zinc-200 bg-white p-4 open:shadow-sm">
            <summary className="cursor-pointer list-none font-bold text-zinc-900 marker:hidden">
              <span className="flex items-center justify-between">
                {f.q}
                <span className="text-orange-500 transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.a}</p>
          </details>
        ))}
      </div>
    </StaticPage>
  );
}
