const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const brandModel = new Schema(
  {
    brandName: {
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

brandModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const brand = mongoose.model("Brand", brandModel);
module.exports = brand;
