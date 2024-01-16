const mongoose = require("mongoose");
const Model = require("../../models/index");
const HTTPError = require("../../utils/CustomError");
const responseHelper = require("../../helper/response.helper");
const BrandHelper = require("../../helper/brand.helper");
const Status = require("../../status");
const catchAsync = require("../../utils/catchAsync");
const pushRepository = require("../pushController");
const pushRepo = new pushRepository();


module.exports = {
  // Retrieve Brand user by BrandId
  getBrandUser: catchAsync(async (req, res, next) => {
    console.log("findBrandById is called");
    try {
      var BrandId = req.params.id;
      console.log(BrandId);

      var result = await BrandHelper.findBrandById(BrandId);

      var message = "BrandId found successfully";
      if (result == null) {
        message = "BrandId does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  // Create a new Brand
  createBrand: catchAsync(async (req, res, next) => {
    console.log("createBrand is called");
    try {
      var BrandData = req.body;
      
      var result = await BrandHelper.createBrand(BrandData);

      var message = "Brand created successfully";
      if (result == null) {
        message = "Brand does not exist.";
      }

      return responseHelper.success(res, BrandData, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

 // Get all Brand users with full details
getAllBrandUsers: catchAsync(async (req, res, next) => {
  console.log("Branddetails is called");
  try {
    // Fetch all brands without pagination
    const brands = await Model.Brand.find({isDeleted:false}).sort("-_id");

    const BrandSize = brands.length;

    const result = {
      Brand: brands,
      count: BrandSize,
    };

    // Check if no brands are found
    if (BrandSize === 0) {
      res.notFound("no record found",result?.Brand)
    }

    // Return a success response with the result
    return responseHelper.success(res, result, "Branddetails found successfully");
  } catch (error) {
    // Handle errors and return a failure response
    responseHelper.requestfailure(res, error);
  }
}),


  updateBrand: catchAsync(async (req, res, next) => {
    try {
      // // Validate the incoming data
      // validateBrandData(req.body);
  
      // Get the Brand user data from the request body
      const BrandUserData = req.body;
  
      // Find the Brand by ID
      const existingBrand = await Model.Brand.findById(BrandUserData.BrandId);
  
      // Check if the Brand exists
      if (!existingBrand) {
        throw new HTTPError(Status.NOT_FOUND, "Brand not found");
      }
  
      // Update the Brand user with the updated data
      const result = await Model.Brand.findByIdAndUpdate(
        BrandUserData.BrandId,
        BrandUserData,
        {
          new: true,
        }
      );
  
      const message = "Brand status updated successfully";
      res.ok(message, result);
    } catch (err) {
      next(err); // Pass the error to the error-handling middleware
    }
  }),
  
  // Delete a Brand user
  declineBrand: catchAsync(async (req, res, next) => {
    var BrandId = req.params.id;
    try {
        // Find the brand by ID and update it to set isDeleted to true
        const updatedBrand = await Model.Brand.findByIdAndUpdate(
            BrandId,
            { isDeleted: true },
            { new: true } // To return the updated document
        );

        // If brand is not found, return a bad request response
        if (!updatedBrand)
            return res.badRequest("Brand not found in our records");

        var message = "Brand deleted successfully";
        res.ok(message, updatedBrand);
    } catch (err) {
        throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
};
