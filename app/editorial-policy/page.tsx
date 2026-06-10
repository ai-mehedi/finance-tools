import type { Metadata } from "next";
import Link from "next/link";
import StaticPage, { H2, P } from "../components/StaticPage";
import JsonLd from "../components/JsonLd";
import { breadcrumbSchema, SITE_NAME } from "@/lib/seo";

const PATH = "/editorial-policy";
const DESC =
  "How TopicDrill researches, writes, reviews and updates its financial calculators and money guides, and the standards every page must meet.";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: `Editorial Policy | ${SITE_NAME}`, description: DESC },
};

export default function EditorialPolicyPage() {
  return (
    <StaticPage
      title="Editorial Policy"
      intro="Money decisions are serious, so we hold our content to a high bar. Here is exactly how we research, write, review and maintain everything on TopicDrill."
      active="About"
    >
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Editorial Policy", path: PATH },
        ])}
      />

      <H2>Our standards</H2>
      <P>
        Every calculator and guide on {SITE_NAME} exists to help you make a clearer financial
        decision. We aim for content that is accurate, genuinely useful, easy to understand, and
        honest about its limits. We would rather say less and be right than pad a page to look
        authoritative.
      </P>

      <H2>How our calculators are built</H2>
      <P>
        Each calculator runs on a transparent formula. The maths behind a tool, the standard
        amortization, compounding, or tax formula it uses, is documented in plain language in the
        &ldquo;How we calculate this&rdquo; section on the page itself. We state our assumptions
        openly (for example, a fixed interest rate, or that figures exclude fees) so you know what
        the result does and does not account for.
      </P>

      <H2>How we research and write</H2>
      <P>
        We start from the real questions people ask about a topic and build the page around them.
        Where a page states a number, a contribution limit, a tax band, an interest rate, we check
        it against the primary source, such as a government or regulator website, and we link to
        that source so you can verify it yourself.
      </P>

      <H2>Review and fact-checking</H2>
      <P>
        Content is reviewed before publication and checked for accuracy, clarity and balance. We
        avoid hype, we do not invent statistics, and we flag when something depends on your personal
        circumstances. Calculators are tested against worked examples to confirm the numbers behave
        correctly.
      </P>

      <H2>Keeping content current</H2>
      <P>
        Finance changes, tax bands, contribution limits and typical rates move over time. We review
        pages on a regular cycle and update them when the underlying rules change. Each page shows
        when it was last reviewed so you can judge how current it is.
      </P>

      <H2>Not financial advice</H2>
      <P>
        Our tools and guides are for general information and education. They are not personal
        financial, tax, legal or investment advice. For decisions that matter, speak to a qualified
        professional who can consider your full situation. See our{" "}
        <Link href="/disclaimer" className="text-orange-600 underline">disclaimer</Link> for more.
      </P>

      <H2>Corrections</H2>
      <P>
        If you spot something wrong or out of date, please tell us through our{" "}
        <Link href="/contact" className="text-orange-600 underline">contact page</Link>. We take
        corrections seriously and fix verified errors promptly.
      </P>
    </StaticPage>
  );
}
