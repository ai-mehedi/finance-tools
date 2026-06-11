import StaticPage, { H2, P } from "../components/StaticPage";
import { openGraphFor } from "@/lib/seo";

export const metadata = {
  title: "Disclaimer",
  alternates: { canonical: "/disclaimer" },
  openGraph: openGraphFor({ path: "/disclaimer", title: "Disclaimer | TopicDrill", description: "How to read the results from TopicDrill's calculators and guides." }),
  description: "How to read the results from TopicDrill's calculators and guides.",
};

export default function DisclaimerPage() {
  return (
    <StaticPage title="Disclaimer" updated="June 2026" intro="A quick note on how to use our numbers.">
      <P>
        Everything on TopicDrill is here to help you learn and plan. It is not financial, investment, tax or legal
        advice, and it is not a substitute for talking to a professional.
      </P>

      <H2>Results are estimates</H2>
      <P>
        Each calculator works from the figures and assumptions you enter. Your real numbers can differ because of
        fees, interest rates, taxes, inflation and rules that change from one country and year to the next. Treat
        the output as a useful guide, not a guarantee.
      </P>

      <H2>Get advice for big decisions</H2>
      <P>
        Before you take out a loan, choose an investment, or make a tax or retirement decision, speak to a licensed
        adviser who can look at your full situation.
      </P>

      <H2>No liability</H2>
      <P>
        TopicDrill and its writers are not responsible for any loss that comes from relying on the tools or content
        on this site. You use them at your own discretion.
      </P>
    </StaticPage>
  );
}
