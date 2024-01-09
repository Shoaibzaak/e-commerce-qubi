const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deleteReasonModel = new Schema(
  {
    deletionReason: {
      type: String,
      require: true,
    },
    orderData: {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
      items: [],
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },

  {
    timestamps: true,
    strict: true,
  }
);

deleteReasonModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const deleteReason = mongoose.model("deleteReason", deleteReasonModel);
module.exports = deleteReason;
