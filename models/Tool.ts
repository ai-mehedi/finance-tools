import { Schema, model, models, Types, type Model, type HydratedDocument } from "mongoose";

export const TOOL_STATUSES = ["active", "inactive", "draft"] as const;
export type ToolStatus = (typeof TOOL_STATUSES)[number];

export const TOOL_TYPES = ["tool", "calculator"] as const;
export type ToolType = (typeof TOOL_TYPES)[number];

export interface IFaq {
  question: string;
  answer: string;
}

export interface ITool {
  title: string;
  slug: string;
  thumbnail?: string;
  url?: string;
  description?: string; // short summary
  content?: string; // long / rich content
  categories: Types.ObjectId[]; // refs -> Category
  type: ToolType;
  faq: IFaq[];
  status: ToolStatus;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

type ToolModelType = Model<ITool>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FaqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ToolSchema = new Schema<ITool, ToolModelType>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true, index: true },
    thumbnail: { type: String }, // URL (e.g. an S3 Media url)
    url: { type: String, trim: true },
    description: { type: String, trim: true },
    content: { type: String },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category", index: true }],
    type: { type: String, enum: TOOL_TYPES, required: true, default: "tool" },
    faq: { type: [FaqSchema], default: [] },
    status: { type: String, enum: TOOL_STATUSES, default: "active" },
    // SEO
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    keywords: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Auto-generate the slug from the title when one isn't provided.
ToolSchema.pre("validate", function () {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  } else if (this.slug) {
    this.slug = slugify(this.slug);
  }
});

export type ToolDoc = HydratedDocument<ITool>;

export const ToolModel =
  (models.Tool as ToolModelType) || model<ITool, ToolModelType>("Tool", ToolSchema);
