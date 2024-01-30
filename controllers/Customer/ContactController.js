const mongoose = require("mongoose");
const HTTPError = require("../../utils/CustomError");
const Status = require("../../status");
const Model = require("../../models/index");
const catchAsync = require("../../utils/catchAsync");

module.exports = {
  // Create a new Contact
  createContact: catchAsync(async (req, res, next) => {
    console.log("createContact is called");
    try {
      const userData = req.body;
      const newContact = new Model.Contact({
        name: userData?.name,
        phone: userData?.phone,
        email: userData?.email,
        subject: userData?.subject,
        message: userData?.message,
      });
      // Save the newContact to the database
      await newContact.save();
      res.ok({ message: "Contact created successfully", newContact });
    } catch (error) {
      console.error(error);
       res.serverError( "Internal Server Error" );
    }
  }),
};
