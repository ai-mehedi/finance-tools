import { connectToDatabase } from "@/lib/mongodb";
import { CategoryModel } from "@/models/Category";
import { ToolModel } from "@/models/Tool";
import { ArticleModel } from "@/models/Article";
import { NavMenuModel } from "@/models/NavMenu";
// Register the User schema so `.populate("author")` works during prerender/build.
import { UserModel } from "@/models/User";
void UserModel;

// Fully serialize lean docs (ObjectId -> string, Date -> ISO) for client components.
function ser<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export type NavItem = { _id: string; title: string; url: string; target: string };
export type NavColumn = NavItem & { children: NavItem[] };

export async function getHeaderNav(): Promise<NavItem[]> {
  await connectToDatabase();
  const items = await NavMenuModel.find({ location: "header", status: "active", parent: null })
    .sort({ order: 1 })
    .lean();
  return ser(items) as unknown as NavItem[];
}

export async function getFooterNav(): Promise<NavColumn[]> {
  await connectToDatabase();
  const items = await NavMenuModel.find({ location: "footer", status: "active" }).sort({ order: 1 }).lean();
  const all = ser(items) as unknown as (NavItem & { parent: string | null })[];
  const parents = all.filter((i) => !i.parent);
  return parents.map((p) => ({ ...p, children: all.filter((c) => String(c.parent) === String(p._id)) }));
}

export type CategoryLite = {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  type: string;
};

export async function getToolCategories(limit?: number): Promise<CategoryLite[]> {
  await connectToDatabase();
  let q = CategoryModel.find({ type: "tool", status: "active" }).sort({ name: 1 });
  if (limit) q = q.limit(limit);
  return ser(await q.lean()) as unknown as CategoryLite[];
}

export async function getBlogCategories(): Promise<(CategoryLite & { count: number })[]> {
  await connectToDatabase();
  const cats = (await CategoryModel.find({ type: "blog", status: "active" }).sort({ name: 1 }).lean()) as unknown as CategoryLite[];
  const counts = await ArticleModel.aggregate([
    { $match: { status: "published" } },
    { $unwind: "$categories" },
    { $group: { _id: "$categories", n: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  return ser(cats.map((c) => ({ ...c, count: byId.get(String(c._id)) ?? 0 }))) as unknown as (CategoryLite & { count: number })[];
}

export async function getToolCategoriesWithCounts(): Promise<(CategoryLite & { count: number })[]> {
  await connectToDatabase();
  const cats = (await CategoryModel.find({ type: "tool", status: "active" }).sort({ name: 1 }).lean()) as unknown as CategoryLite[];
  const counts = await ToolModel.aggregate([
    { $match: { status: "active" } },
    { $unwind: "$categories" },
    { $group: { _id: "$categories", n: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  return ser(cats.map((c) => ({ ...c, count: byId.get(String(c._id)) ?? 0 }))) as unknown as (CategoryLite & { count: number })[];
}

export async function getCategoryBySlug(slug: string, type: "tool" | "blog" = "tool") {
  await connectToDatabase();
  const cat = await CategoryModel.findOne({ slug, type }).lean();
  return cat ? (ser(cat) as unknown as CategoryLite) : null;
}

export type ToolLite = {
  _id: string;
  title: string;
  slug: string;
  type: string;
  description?: string;
  thumbnail?: string;
  categories?: CategoryLite[];
};

export async function getTools(opts: { categoryId?: string; q?: string; type?: string; limit?: number; page?: number } = {}): Promise<{
  data: ToolLite[];
  total: number;
  pages: number;
}> {
  await connectToDatabase();
  const filter: Record<string, unknown> = { status: "active" };
  if (opts.categoryId) filter.categories = opts.categoryId;
  if (opts.type) filter.type = opts.type;
  if (opts.q) filter.title = { $regex: opts.q, $options: "i" };
  const limit = opts.limit ?? 12;
  const page = opts.page ?? 1;
  const [data, total] = await Promise.all([
    ToolModel.find(filter).populate("categories", "name slug").sort({ title: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    ToolModel.countDocuments(filter),
  ]);
  return { data: ser(data) as unknown as ToolLite[], total, pages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getToolBySlug(slug: string) {
  await connectToDatabase();
  const tool = await ToolModel.findOne({ slug, status: "active" }).populate("categories", "name slug").lean();
  return tool ? (ser(tool) as unknown as ToolLite & { content?: string; faq?: { question: string; answer: string }[]; metaTitle?: string; metaDescription?: string }) : null;
}

export type ArticleLite = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  createdAt: string;
  categories?: CategoryLite[];
  author?: { firstname?: string; lastname?: string; avatar?: string };
};

export async function getArticles(opts: { categoryId?: string; limit?: number; page?: number } = {}): Promise<{
  data: ArticleLite[];
  total: number;
  pages: number;
}> {
  await connectToDatabase();
  const filter: Record<string, unknown> = { status: "published" };
  if (opts.categoryId) filter.categories = opts.categoryId;
  const limit = opts.limit ?? 6;
  const page = opts.page ?? 1;
  const [data, total] = await Promise.all([
    ArticleModel.find(filter)
      .populate("author", "firstname lastname avatar")
      .populate("categories", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ArticleModel.countDocuments(filter),
  ]);
  return { data: ser(data) as unknown as ArticleLite[], total, pages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getArticleBySlug(slug: string) {
  await connectToDatabase();
  const article = await ArticleModel.findOne({ slug, status: "published" })
    .populate("author", "firstname lastname avatar")
    .populate("categories", "name slug")
    .lean();
  return article
    ? (ser(article) as unknown as ArticleLite & { content?: string; focusKeyword?: string; metaTitle?: string; metaDescription?: string })
    : null;
}

/** Slugs for sitemap generation. */
export async function getAllSlugs() {
  await connectToDatabase();
  const [tools, toolCats, blogCats, articles] = await Promise.all([
    ToolModel.find({ status: "active" }).select("slug updatedAt").lean(),
    CategoryModel.find({ type: "tool", status: "active" }).select("slug updatedAt").lean(),
    CategoryModel.find({ type: "blog", status: "active" }).select("slug updatedAt").lean(),
    ArticleModel.find({ status: "published" }).select("slug updatedAt").lean(),
  ]);
  return ser({ tools, toolCats, blogCats, articles }) as unknown as {
    tools: { slug: string; updatedAt: string }[];
    toolCats: { slug: string; updatedAt: string }[];
    blogCats: { slug: string; updatedAt: string }[];
    articles: { slug: string; updatedAt: string }[];
  };
}
