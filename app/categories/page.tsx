import SiteHeader from "../components/SiteHeader";
import AllCategories from "../components/AllCategories";
import Newsletter from "../components/Newsletter";
import TrustBadges from "../components/TrustBadges";
import Footer from "../components/Footer";
import { getToolCategoriesWithCounts } from "@/lib/queries";

export const revalidate = 3600;

export const metadata = {
  title: "All Categories",
  alternates: { canonical: "/categories" },
  description: "Browse all financial tool categories for budgeting, investing, loans, taxes, savings and more.",
};

export default async function CategoriesPage() {
  const categories = await getToolCategoriesWithCounts();
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <SiteHeader active="Categories" />
      <main className="flex-1">
        <AllCategories categories={categories} />
        <Newsletter />
        <TrustBadges />
      </main>
      <Footer />
    </div>
  );
}
