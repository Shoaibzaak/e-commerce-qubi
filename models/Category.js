const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoryModel = new Schema(
  {
    categoryName: {
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

categoryModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const category = mongoose.model("category", categoryModel);
module.exports = category;
