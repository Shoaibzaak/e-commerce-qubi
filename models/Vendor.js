const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vendorModel = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    password: {
      type: String,
    },
    bio: {
      type: String,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
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

vendorModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const Vendor = mongoose.model("Vendor", vendorModel);
module.exports = Vendor;
