const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewModel = new Schema(
  {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        // required: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Assuming you have a Product model
        // required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
      comment: {
        type: String,
      },
  },

  {
    timestamps: true,
    strict: true,
  }
);

reviewModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const review = mongoose.model("Review", reviewModel);
module.exports = review;
