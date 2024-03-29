const mongoose = require("mongoose");
const Model = require("../../models/index");
const HTTPError = require("../../utils/CustomError");
const Message = require("../../Message");
const responseHelper = require("../../helper/response.helper");
const Status = require("../../status");
const catchAsync = require("../../utils/catchAsync");
const Validation = require("../../utils/validations/validation");
const Services = require("../../services");
const cloudUpload = require("../../cloudinary");
module.exports = {
  // Retrieve Vendor user by VendorId
  getVendorUser: catchAsync(async (req, res, next) => {
    // Extract the VendorId from the request parameters
    const vendorId = req.params.id;
    // Perform a database query to find the vendor user by VendorId
    const vendorUser = await Model.Vendor.findById(vendorId).populate("address");

    // Check if the vendor user is found
    if (!vendorUser) {
      return res.status(404).json({ message: "Vendor user not found" });
    }

    const message = "Vendor created successfully";
    res.ok(message, vendorUser);
  }),

  // Create a new Vendor
  createVendor: catchAsync(async (req, res, next) => {
    try {
      const { firstName, lastName, email, phoneNumber, bio } = req.body;
      const { address } = req.body;
  
      // Email validation
      // if (!Validation.validateEmail(email)) {
      //   return res.badRequest("Invalid email format");
      // }
  
      const verifyEmail = await Model.Vendor.findOne({ email });
  
      if (verifyEmail) {
        throw new HTTPError(Status.BAD_REQUEST, Message.emailAlreadyExists);
      }
  
      let cloudinaryResult;
      if (req.files.profilePic) {
        const file = req.files.profilePic[0]; // Assuming you only want to handle one profile picture
        const { path } = file;
  
        // Upload the file to Cloudinary
        cloudinaryResult = await cloudUpload.cloudinaryUpload(path);
      }
  
      let savedAddress;
  
      if (address) {
        const addressData = JSON.parse(address);
           savedAddress = await new Model.Address(addressData).save();
      }      
    //call the dummyPassword to get the 8 characters password  
    const tempPassword=Services.DummyPassword.dummyPassword(8)
      const vendor = new Model.Vendor({
        firstName,
        lastName,
        email,
        profilePic: cloudinaryResult,
        phoneNumber,
        bio,
        password: tempPassword,
        address: savedAddress ? savedAddress._id : null, // Save address _id in vendor model
      });
  
      await vendor.save();
  
      const emailMessage = `
        Dear ${firstName} ${lastName},
  
        You are added by admin of MATT.
  
        Your temporary password is: ${tempPassword}
  
        Use your temporary password ${tempPassword} and gmail ${email} to login
  
        Best regards,
        The MATT Team
      `;
  
      // Send the email with the message directly
      await Services.EmailService.sendEmail(
        emailMessage,
        email,
        email,
        "User Account Email Verification | vagabond"
      );
  
      return res.ok("Vendor registered successfully.", vendor);
    } catch (err) {
      next(err);
    }
  }),
  
  // Get all Vendor users with full details
  getAllVendorUsers: catchAsync(async (req, res, next) => {
    console.log("Vendordetails is called");
    try {
      // Fetch all Vendors without pagination
      const vendors = await Model.Vendor.find({ isDeleted: false }).populate("address").sort(
        "-_id"
      );

      const vendorSize = vendors.length;

      const result = {
        Vendor: vendors,
        count: vendorSize,
      };

      // Return a success response with the result
      return responseHelper.success(
        res,
        result,
        "Vendordetails found successfully"
      );
    } catch (error) {
      // Handle errors and return a failure response
      responseHelper.requestfailure(res, error);
    }
  }),

  updateVendor: catchAsync(async (req, res, next) => {
    try {
      // Get the Vendor user data from the request body
      const vendorUserData = req.body;

      // Find the Vendor by ID
      const existingVendor = await Model.Vendor.findById(
        vendorUserData.vendorId
      );

      // Check if the Vendor exists
      if (!existingVendor) {
        throw new HTTPError(Status.NOT_FOUND, "Vendor not found");
      }

      // Update the Vendor user with the updated data
      const result = await Model.Vendor.findByIdAndUpdate(
        vendorUserData.vendorId,
        vendorUserData,
        {
          new: true,
        }
      );

      const message = "Vendor status updated successfully";
      res.ok(message, result);
    } catch (err) {
      next(err); // Pass the error to the error-handling middleware
    }
  }),

  // Delete a Vendor user
  declineVendor: catchAsync(async (req, res, next) => {
    var vendorId = req.params.id;
    try {
      // Find the Vendor by ID and update it to set isDeleted to true
      const updatedVendor = await Model.Vendor.findByIdAndUpdate(
        vendorId,
        { isDeleted: true },
        { new: true } // To return the updated document
      );

      // If Vendor is not found, return a bad request response
      if (!updatedVendor)
        return res.badRequest("Vendor not found in our records");

      var message = "Vendor deleted successfully";
      res.ok(message, updatedVendor);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
  uploadVendorProfilePic: catchAsync(async (req, res, next) => {
    const userData = req.body;
    const { address } = req.body;
    try {
      if (req.files.profilePic) {
        const file = req.files.profilePic[0]; // Assuming you only want to handle one profile picture
        const { path } = file;

        // Upload the file to Cloudinary
        var cloudinaryResult = await cloudUpload.cloudinaryUpload(path);
      }
      // Fetch the user
      const user = await Model.Vendor.findById(userData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Handle address update
      if (address) {
        const addressData = JSON.parse(address);
        let savedAddress;

        // Check if user already has an address
        if (user.address) {
          savedAddress = await Model.Address.findByIdAndUpdate(
            user.address,
            addressData,
            { new: true }
          );
        } else {
          savedAddress = await new Model.Address(addressData).save();
        }

        user.address = savedAddress._id;
      }
      const result = await Model.Vendor.findByIdAndUpdate(
        { _id: userData.userId },
        {
          profilePic: cloudinaryResult,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          bio: userData.bio,
          address: user.address,
        },
        { new: true, runValidators: true }
      );
      if (!result) {
        console.log("User not found");
        throw new HTTPError(Status.NOT_FOUND, "User not found");
      }

      const message = " Data updated successfully";
      console.log(message);
      res.ok(message, result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }),
};
