import mongoose, { Schema, Document } from "mongoose";

export interface IRelease extends Document {
  status: "DRAFT" | "LIVE" | "LOCKED";
  totalSlots: number;
  securedSlots: number;
  releaseName: string;
  price: number;
  launchAt: string;
  releasedAt: string | null;
}

const ReleaseSchema = new Schema<IRelease>(
  {
    status: {
      type: String,
      enum: ["DRAFT", "LIVE", "LOCKED"],
      default: "DRAFT",
    },

    totalSlots: {
      type: Number,
      default: 50,
    },

    securedSlots: {
      type: Number,
      default: 0,
    },

    releaseName: {
      type: String,
      default: "HUSNAINS EDITION",
    },

    price: {
      type: Number,
      default: 999,
    },

    launchAt: {
      type: String,
      default: "",
    },

    releasedAt: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Release =
  mongoose.models.Release ||
  mongoose.model<IRelease>("Release", ReleaseSchema);

export default Release;