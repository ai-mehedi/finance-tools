// A queue of planned blog topics. The one-click "generate batch" button and the
// daily cron pull the next `pending` topics from here, generate a draft article
// for each, and flip the topic to `generated` (or `failed` with an error).

import { Schema, model, models, Types, type Model, type HydratedDocument } from "mongoose";

export const TOPIC_STATUSES = ["pending", "generated", "failed"] as const;
export type TopicStatus = (typeof TOPIC_STATUSES)[number];

export interface IArticleTopic {
  title: string;
  slug?: string;
  categorySlug?: string; // resolved to a blog Category at generation time
  focusKeyword?: string;
  secondaryKeywords: string[];
  paaQuestions: string[];
  uniqueAngle?: string;
  market?: string; // "US" | "UK" | "global"
  intent?: string;
  status: TopicStatus;
  order: number; // lower runs first
  articleId?: Types.ObjectId; // ref -> Article once generated
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

type ArticleTopicModelType = Model<IArticleTopic>;

const ArticleTopicSchema = new Schema<IArticleTopic, ArticleTopicModelType>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true, index: true },
    categorySlug: { type: String, trim: true },
    focusKeyword: { type: String, trim: true },
    secondaryKeywords: { type: [String], default: [] },
    paaQuestions: { type: [String], default: [] },
    uniqueAngle: { type: String, trim: true },
    market: { type: String, trim: true, default: "US" },
    intent: { type: String, trim: true },
    status: { type: String, enum: TOPIC_STATUSES, default: "pending", index: true },
    order: { type: Number, default: 0, index: true },
    articleId: { type: Schema.Types.ObjectId, ref: "Article" },
    error: { type: String },
  },
  { timestamps: true }
);

export type ArticleTopicDoc = HydratedDocument<IArticleTopic>;

export const ArticleTopicModel =
  (models.ArticleTopic as ArticleTopicModelType) ||
  model<IArticleTopic, ArticleTopicModelType>("ArticleTopic", ArticleTopicSchema);
