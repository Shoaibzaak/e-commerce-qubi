const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoryModel = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category', // Reference to the Category model
      default: null,   // No parent category by default (top-level category)
    },
    childCategories: [{
      categoryName: {
        type: String,
      },
    }],
    isFeatured: {
      type: Boolean,
      default: false,
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

const category = mongoose.model("Category", categoryModel);
module.exports = category;
