import { Schema, model, models, type Model, type HydratedDocument } from "mongoose";

export const SUBSCRIBER_STATUSES = ["subscribed", "unsubscribed"] as const;
export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number];

export interface ISubscriber {
  email: string;
  status: SubscriberStatus;
  source?: string; // where they subscribed from (e.g. "footer", "blog")
  createdAt: Date;
  updatedAt: Date;
}

type SubscriberModelType = Model<ISubscriber>;

const SubscriberSchema = new Schema<ISubscriber, SubscriberModelType>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email."],
    },
    status: { type: String, enum: SUBSCRIBER_STATUSES, default: "subscribed", index: true },
    source: { type: String, trim: true },
  },
  { timestamps: true }
);

export type SubscriberDoc = HydratedDocument<ISubscriber>;

export const SubscriberModel =
  (models.Subscriber as SubscriberModelType) ||
  model<ISubscriber, SubscriberModelType>("Subscriber", SubscriberSchema);
