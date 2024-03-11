const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const variationSchema = new Schema({
  color: {
    type: String,
  },
  quantity: {
    type: Number,
    min: 0,
  },
  size: {
    type: String,
    enum: ["Small", "Medium", "Large"],
  },
  sku: {
    type: String,
    // unique: true,
    // required: true,
  },
});

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
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    price: {
      type: Number,
      min: 0,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    store: {
      type: String,
    },
    modal: {
      type: String,
    },
    availability: {
      type: String,
      enum: ["In Stock", "Out Stock", "Low Stock"],
      default: "In Stock",
    },
    quantity: {
      type: Number,
      min: 1,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    productType: {
      type: String,
      enum: ["simple", "variations"],
      required: true,
      default: "simple", // Default to simple product type
    },
    sku: {
      // SKU field directly under the product for simple products
      type: String,
      // unique: true,
    },
    color: {
      type: String,
    },
    size: {
      type: String,
      enum: ["Small", "Medium", "Large"],
    },
    // Allow for additional attributes dynamically
    customAttributes: {
      type: Schema.Types.Mixed,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    variations: [variationSchema],
    // reviews: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Review",
    // }],
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
    strict: false, // Allow for dynamic attributes
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
