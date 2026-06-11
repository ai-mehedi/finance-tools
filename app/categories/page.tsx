import SiteHeader from "../components/SiteHeader";
import AllCategories from "../components/AllCategories";
import Newsletter from "../components/Newsletter";
import TrustBadges from "../components/TrustBadges";
import Footer from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { getToolCategoriesWithCounts } from "@/lib/queries";
import { openGraphFor } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = {
  title: "All Categories",
  alternates: { canonical: "/categories" },
  openGraph: openGraphFor({ path: "/categories", title: "All Categories | TopicDrill", description: "Browse all financial tool categories for budgeting, investing, loans, taxes, savings and more." }),
  description: "Browse all financial tool categories for budgeting, investing, loans, taxes, savings and more.",
};

export default async function CategoriesPage() {
  const categories = await getToolCategoriesWithCounts();
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <SiteHeader active="Categories" />
      <main className="flex-1">
        <div className="mx-auto container px-6 pt-8"><AdSlot /></div>
        <AllCategories categories={categories} />
        <div className="mx-auto container px-6 pb-10"><AdSlot /></div>
        <Newsletter />
        <TrustBadges />
      </main>
      <Footer />
    </div>
  );
}
