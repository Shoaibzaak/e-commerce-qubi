const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productModel = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    model: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
    },
    price: {
      type: Number,
    },
    productRate: {
      type: Number,
    },
    quantity: {
      type: Number,
    },
    // type: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "category",
    // },
    type: {
      type: String,
    },
    color: {
      type: String,
    },
    store: {
      type: String,
    },
    availability: {
      type: String,
      enum: ["In Stock", "Out Stock", "Low Stock"],
      default: "In Stock",
    },
    size: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Cancelled", "Shipped", "Processing"],
      default: "Processing",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isWhished: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
    strict: true,
  }
);

productModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const product = mongoose.model("product", productModel);
module.exports = product;
