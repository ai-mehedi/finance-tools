import Link from "next/link";
import StaticPage, { H2, P } from "../components/StaticPage";

export const metadata = {
  title: "Terms of Use",
  description: "The simple rules for using TopicDrill's calculators and content.",
};

export default function TermsPage() {
  return (
    <StaticPage title="Terms of Use" updated="June 2026" intro="By using TopicDrill you agree to the points below. We have kept them short and readable.">
      <H2>Using the site</H2>
      <P>
        You are welcome to use our calculators and read our guides for your own personal planning, free of charge.
        Please do not scrape the site in bulk, resell our content as your own, or try to disrupt the service for
        other people.
      </P>

      <H2>This is not financial advice</H2>
      <P>
        TopicDrill is an educational resource. It does not provide financial, investment, tax or legal advice, and
        using it does not create a client relationship. For decisions that affect your money, talk to a qualified
        professional who knows your situation.
      </P>

      <H2>Accuracy</H2>
      <P>
        We build our tools on standard formulas and test them carefully, but results are estimates. Real outcomes
        depend on rates, fees, taxes and rules that vary by country and change over time. Always confirm important
        figures before you act on them.
      </P>

      <H2>Our content</H2>
      <P>
        The text, design and tools on this site belong to TopicDrill. You can link to our pages freely, but please
        ask before republishing our content elsewhere.
      </P>

      <H2>Liability</H2>
      <P>
        We provide the site as is. TopicDrill is not responsible for losses that result from decisions you make
        based on our tools or articles.
      </P>

      <H2>Changes</H2>
      <P>
        We may update these terms as the site grows. The date at the top shows the latest version. Questions are
        welcome on our <Link href="/contact" className="font-semibold text-orange-600 hover:underline">contact page</Link>.
      </P>
    </StaticPage>
  );
}
