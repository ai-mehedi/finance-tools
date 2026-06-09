import Link from "next/link";
import StaticPage, { H2, P } from "../components/StaticPage";

export const metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy-policy" },
  description: "What TopicDrill collects, what it does not, and how we handle your information.",
};

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy" updated="June 2026" intro="Short version: the numbers you type into calculators stay in your browser. We only keep what you choose to give us.">
      <H2>What we collect</H2>
      <P>
        Our calculators run on your device. The values you enter are not sent to us and are not stored on our
        servers. We collect personal information only when you give it to us, which happens in two cases: when you
        subscribe to the newsletter (your email address) and when you use the contact form (your name, email and
        message).
      </P>

      <H2>What we do with it</H2>
      <ul className="mb-4 space-y-2 text-[15px] text-zinc-600">
        <li className="flex gap-2"><span className="text-orange-500">•</span> Send the newsletter you signed up for. Every email has an unsubscribe link.</li>
        <li className="flex gap-2"><span className="text-orange-500">•</span> Reply to messages you send through the contact form.</li>
        <li className="flex gap-2"><span className="text-orange-500">•</span> Look at anonymous, aggregated traffic so we know which tools to improve.</li>
      </ul>
      <P>We do not sell your data, and we do not share it with advertisers.</P>

      <H2>Cookies and analytics</H2>
      <P>
        We may use privacy-friendly analytics to count visits and see which pages are popular. These do not identify
        you personally. You can block cookies in your browser settings without breaking the calculators.
      </P>

      <H2>Your choices</H2>
      <P>
        You can unsubscribe from emails at any time, and you can ask us to delete the information you have shared.
        Just send the request through our contact page.
      </P>

      <H2>Questions</H2>
      <P>
        If anything here is unclear, reach out on the{" "}
        <Link href="/contact" className="font-semibold text-orange-600 hover:underline">contact page</Link> and we will explain.
      </P>
    </StaticPage>
  );
}
