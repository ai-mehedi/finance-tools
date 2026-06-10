import SiteHeader from "./components/SiteHeader";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import FinancialTools from "./components/FinancialTools";
import Categories from "./components/Categories";
import CtaBanner from "./components/CtaBanner";
import WhyChoose from "./components/WhyChoose";
import Articles from "./components/Articles";
import HomeContent from "./components/HomeContent";
import RecentlyUsed from "./components/RecentlyUsed";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import { AdSlot } from "./components/AdSlot";
import { getToolCategories, getToolCategoriesWithCounts, getTools, getArticles } from "@/lib/queries";

export const revalidate = 3600; // ISR: refresh hourly

export default async function Home() {
  const [categories, categoriesWithCounts, popularTools, latestArticles] = await Promise.all([
    getToolCategories(8),
    getToolCategoriesWithCounts(),
    getTools({ limit: 10 }),
    getArticles({ limit: 4 }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto container px-6"><AdSlot className="my-4" /></div>
        <Hero />
        <RecentlyUsed />
        <StatsBar />
        <div className="mx-auto container px-6"><AdSlot className="my-4" /></div>
        <FinancialTools tools={popularTools.data} />
        <div className="mx-auto container px-6"><AdSlot className="my-4" /></div>
        <Categories categories={categories} />
        <CtaBanner />
        <WhyChoose />
        <div className="mx-auto container px-6"><AdSlot className="my-4" /></div>
        <Articles articles={latestArticles.data} popularTools={popularTools.data.slice(0, 6)} />
        <HomeContent categories={categoriesWithCounts} />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
