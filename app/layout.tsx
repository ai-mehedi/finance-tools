import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import JsonLd from "./components/JsonLd";
import { organizationSchema, websiteSchema, SITE_URL } from "@/lib/seo";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://topicdrill.com"),
  title: {
    default: "TopicDrill — Free Financial Tools & Calculators",
    template: "%s | TopicDrill",
  },
  description:
    "Free, fast financial calculators and clear money guides covering loans, mortgage, investing, taxes, savings and retirement. No sign-ups, no clutter.",
  applicationName: "TopicDrill",
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "TopicDrill",
    type: "website",
    url: SITE_URL,
    title: "TopicDrill — Free Financial Tools & Calculators",
    description: "200+ free financial calculators and clear money guides. No sign-ups, no clutter.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "TopicDrill — Free Financial Tools & Calculators" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TopicDrill — Free Financial Tools & Calculators",
    description: "200+ free financial calculators and clear money guides.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  ...(ADSENSE_CLIENT ? { other: { "google-adsense-account": ADSENSE_CLIENT } } : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {GTM_ID && (
          <>
            <Script id="gtm" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        )}
        {/* Plain script (not next/script) so AdSense doesn't see a data-nscript attribute.
            Only load in production — AdSense never fills on localhost and shows an empty/broken slot. */}
        {ADSENSE_CLIENT && process.env.NODE_ENV === "production" && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        {children}
      </body>
    </html>
  );
}
