import { Schema, model, models, type Model, type HydratedDocument } from "mongoose";

export const CATEGORY_STATUSES = ["active", "inactive"] as const;
export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export const CATEGORY_TYPES = ["tool", "blog"] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export interface ICategory {
  name: string;
  slug: string;
  thumbnail?: string;
  status: CategoryStatus;
  type: CategoryType;
  createdAt: Date;
  updatedAt: Date;
}

type CategoryModelType = Model<ICategory>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CategorySchema = new Schema<ICategory, CategoryModelType>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    thumbnail: { type: String }, // URL (e.g. an S3 Media url)
    status: { type: String, enum: CATEGORY_STATUSES, default: "active" },
    type: { type: String, enum: CATEGORY_TYPES, required: true, default: "tool" },
  },
  { timestamps: true }
);

// Unique per type so a "tool" and a "blog" category can share a slug (e.g. investing).
CategorySchema.index({ type: 1, slug: 1 }, { unique: true });

// Auto-generate the slug from the name when one isn't provided.
CategorySchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  } else if (this.slug) {
    this.slug = slugify(this.slug);
  }
});

export type CategoryDoc = HydratedDocument<ICategory>;

export const CategoryModel =
  (models.Category as CategoryModelType) ||
  model<ICategory, CategoryModelType>("Category", CategorySchema);
