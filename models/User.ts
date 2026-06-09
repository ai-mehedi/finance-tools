import { Schema, model, models, type Model, type HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";

export const USER_STATUSES = ["active", "inactive", "pending", "banned"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface IUser {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  avatar?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModelType = Model<IUser, object, IUserMethods>;

const UserSchema = new Schema<IUser, UserModelType, IUserMethods>(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email."],
    },
    // select:false keeps the hash out of query results unless explicitly requested.
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String }, // URL (e.g. an S3 Media url)
    status: { type: String, enum: USER_STATUSES, default: "active" },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).password;
        return ret;
      },
    },
  }
);

// Convenience virtual: full name.
UserSchema.virtual("fullName").get(function (this: IUser) {
  return `${this.firstname} ${this.lastname}`;
});

// Hash the password whenever it is set or changed.
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export type UserDoc = HydratedDocument<IUser, IUserMethods>;

export const UserModel =
  (models.User as UserModelType) || model<IUser, UserModelType>("User", UserSchema);
