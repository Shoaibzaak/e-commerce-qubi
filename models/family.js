const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const familyModel = new Schema(
  {
    name: {
      type: String,
      required:true
    },
    contactNumber: {
      type: Number,
    },
    relation: {
      type: String
    },
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
      },
      coordinates: {
        type: [Number],
      }
    },
    userId:{type: mongoose.Schema.Types.ObjectId,ref: "User",required:true},
    
  },

  {
    timestamps: true,
    strict: true,
  }
);

familyModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const family = mongoose.model("family", familyModel);
module.exports = family;
