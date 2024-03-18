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
      ref: 'Category',
      default: null,
    },
    childCategories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category'
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

categoryModel.methods.customUpdate = async function (updateFields) {
  console.log("middleware is calling there====>");
  try {
    const categoryId = this._id;
    console.log(categoryId, "categoryId");

    // Check if the category has child categories
    const childCategories = await this.model('Category').find({ parentCategory: categoryId });

    if (childCategories.length > 0) {
      const error = new Error('Cannot update category with child categories.');
      error.childCategories = childCategories;
      throw error;
    }

    // // Check if the category is a child category
    // if (this.parentCategory) {
    //   const parentCategory = await this.model('Category').findById(this.parentCategory);
    //   if (parentCategory) {
    //     const error = new Error('Cannot update a category that is a child category.');
    //     throw error;
    //   }
    // }

    // No child categories found, proceed with the update
    Object.assign(this, updateFields);
    await this.save();

    return this;
  } catch (error) {
    throw error;
  }
};

const Category = mongoose.model("Category", categoryModel);
module.exports = Category;
