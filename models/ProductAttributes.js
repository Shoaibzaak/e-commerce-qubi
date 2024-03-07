const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productAttributesModel = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
      },
  },

  {
    timestamps: true,
    strict: true,
  }
);


productAttributesModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const productAttributes = mongoose.model("ProductAttributes", productAttributesModel);
module.exports = productAttributes;
