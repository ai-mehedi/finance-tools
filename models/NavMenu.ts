import { Schema, model, models, Types, type Model, type HydratedDocument } from "mongoose";

export const NAVMENU_STATUSES = ["active", "inactive"] as const;
export type NavMenuStatus = (typeof NAVMENU_STATUSES)[number];

export const NAVMENU_LOCATIONS = ["header", "footer"] as const;
export type NavMenuLocation = (typeof NAVMENU_LOCATIONS)[number];

export const NAVMENU_TARGETS = ["_self", "_blank"] as const;
export type NavMenuTarget = (typeof NAVMENU_TARGETS)[number];

export interface INavMenu {
  title: string;
  url: string;
  location: NavMenuLocation;
  parent?: Types.ObjectId | null; // self-ref -> NavMenu (for dropdown children)
  order: number;
  target: NavMenuTarget;
  status: NavMenuStatus;
  createdAt: Date;
  updatedAt: Date;
}

type NavMenuModelType = Model<INavMenu>;

const NavMenuSchema = new Schema<INavMenu, NavMenuModelType>(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true, default: "#" },
    location: { type: String, enum: NAVMENU_LOCATIONS, default: "header", index: true },
    parent: { type: Schema.Types.ObjectId, ref: "NavMenu", default: null, index: true },
    order: { type: Number, default: 0 },
    target: { type: String, enum: NAVMENU_TARGETS, default: "_self" },
    status: { type: String, enum: NAVMENU_STATUSES, default: "active" },
  },
  { timestamps: true }
);

export type NavMenuDoc = HydratedDocument<INavMenu>;

export const NavMenuModel =
  (models.NavMenu as NavMenuModelType) ||
  model<INavMenu, NavMenuModelType>("NavMenu", NavMenuSchema);
