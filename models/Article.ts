import { Schema, model, models, Types, type Model, type HydratedDocument } from "mongoose";

export const ARTICLE_STATUSES = ["draft", "published", "archived"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export interface IArticle {
  title: string;
  slug: string;
  focusKeyword?: string;
  excerpt?: string;
  content?: string;
  categories: Types.ObjectId[]; // refs -> Category
  author: Types.ObjectId; // ref -> User
  featuredImage?: string; // URL (e.g. an S3 Media url)
  status: ArticleStatus;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

type ArticleModelType = Model<IArticle>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ArticleSchema = new Schema<IArticle, ArticleModelType>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true, index: true },
    focusKeyword: { type: String, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category", index: true }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    featuredImage: { type: String },
    status: { type: String, enum: ARTICLE_STATUSES, default: "draft" },
    // SEO
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    keywords: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Auto-generate the slug from the title when one isn't provided.
ArticleSchema.pre("validate", function () {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  } else if (this.slug) {
    this.slug = slugify(this.slug);
  }
});

export type ArticleDoc = HydratedDocument<IArticle>;

export const ArticleModel =
  (models.Article as ArticleModelType) ||
  model<IArticle, ArticleModelType>("Article", ArticleSchema);
