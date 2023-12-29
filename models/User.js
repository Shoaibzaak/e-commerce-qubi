// user.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserModel = new Schema(
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
    password: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    otp: {
      type: Number,
    },
    otpExpiry: {
      type: Number,
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    facebookId: {
      type: String,
    },
    googleId: {
      type: String,
    },
    accessToken: {
      type: String,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// ... (rest of the code)

const User = mongoose.model("User", UserModel);
module.exports = User;
