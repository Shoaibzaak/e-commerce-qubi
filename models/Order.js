const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderModel = new Schema(
  {
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payment: {
      method: {
        type: String,
        enum: ["credit card", "paypal", "cash"],
        // required: true,
      },
      amount: {
        type: Number,
        // required: true,
      },
      // other payment details
    },
    // other fields as needed
  },

  {
    timestamps: true,
    strict: true,
  }
);

orderModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const order = mongoose.model("Order", orderModel);
module.exports = order;
