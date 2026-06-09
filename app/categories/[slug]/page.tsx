import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import CategoryDetail from "../../components/CategoryDetail";
import Newsletter from "../../components/Newsletter";
import TrustBadges from "../../components/TrustBadges";
import Footer from "../../components/Footer";
import JsonLd from "../../components/JsonLd";
import { getCategoryBySlug, getTools, getToolCategoriesWithCounts } from "@/lib/queries";
import { breadcrumbSchema } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug, "tool");
  if (!category) return { title: "Category not found" };
  const title = `${category.name} Tools & Calculators`;
  const description = `Free ${category.name.toLowerCase()} calculators and tools to plan smarter and reach your financial goals.`;
  return {
    title,
    description,
    alternates: { canonical: `/categories/${slug}` },
    openGraph: { type: "website", url: `/categories/${slug}`, title, description },
  };
}

export default async function CategorySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug, "tool");
  if (!category) notFound();

  const [tools, allCats] = await Promise.all([
    getTools({ categoryId: category._id, limit: 60 }),
    getToolCategoriesWithCounts(),
  ]);
  const related = allCats.filter((c) => c._id !== category._id).slice(0, 8);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
          { name: category.name, path: `/categories/${category.slug}` },
        ])}
      />
      <SiteHeader active="Categories" />
      <main className="flex-1">
        <CategoryDetail category={category} tools={tools.data} related={related} />
        <Newsletter
          variant="soft"
          heading={`Get Weekly ${category.name} Tips & Updates`}
          subtitle={`Subscribe to our newsletter and get the best ${category.name.toLowerCase()} tips, tools and guides straight to your inbox.`}
        />
        <TrustBadges />
      </main>
      <Footer />
    </div>
  );
}
