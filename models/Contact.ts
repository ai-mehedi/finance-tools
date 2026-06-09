import { Schema, model, models, type Model, type HydratedDocument } from "mongoose";

export const CONTACT_STATUSES = ["new", "read", "replied", "archived"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export interface IContact {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

type ContactModelType = Model<IContact>;

const ContactSchema = new Schema<IContact, ContactModelType>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email."],
    },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: CONTACT_STATUSES, default: "new", index: true },
  },
  { timestamps: true }
);

export type ContactDoc = HydratedDocument<IContact>;

export const ContactModel =
  (models.Contact as ContactModelType) ||
  model<IContact, ContactModelType>("Contact", ContactSchema);
