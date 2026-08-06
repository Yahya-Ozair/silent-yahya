import { Schema, model, models } from "mongoose";

const WishlistSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    productId: {
  type: Schema.Types.ObjectId,
  ref: "Product",
  required: true,
},
  },
  {
    timestamps: true,
  }
);

export default models.Wishlist || model("Wishlist", WishlistSchema);