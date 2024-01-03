const mongoose = require("mongoose");
const encrypt = require("bcrypt");
const moment = require("moment");
const Schema = mongoose.Schema;
const AdminModel = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      default: "admin",
    },
    phoneNumber: {
      type: Number,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
    profilePic: {
      type: String,
    },
    password: {
      type: String,
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

AdminModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret.password;
  },
});

// AdminModel.pre("save", function (next) {
//   encrypt.genSalt(10, (error, salt) => {
//     if (error) return console.log(error);
//     encrypt.hash(this.password, salt, (error, hash) => {
//       this.password = hash;
//       next();
//     });
//   });
// });
AdminModel.methods.comparePassword = async function (password) {
  const match = await encrypt.compare(password, this.password);
  if (match) return true;
  return false;
};

const Admin = mongoose.model("Admin", AdminModel);
module.exports = Admin;
