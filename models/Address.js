// address.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
  state: {
    type: String
  },
  country: {
    type: String
  },
  city: {
    type: String
  },
  zipCode: {
    type: String
  },
  streetAddress: {
    type: String
  },
  shippingAddress: {
    type: String
  }
});

const Address = mongoose.model("Address", AddressSchema);

module.exports = Address;
