const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    //   required: true,
    },
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    //   quantity: {
    //     type: Number,
    //     default: 1,
    //   },
    }],
    // other fields as needed
  },
  {
    timestamps: true,
    strict: true,
  }
);

cartSchema.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
