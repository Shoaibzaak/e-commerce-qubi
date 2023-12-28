const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
        type: String,
      },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // You can add other fields like timestamps, reference to a user (if logged in), etc.
  },
  {
    timestamps: true,
    strict: true,
  }
);

contactSchema.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;
