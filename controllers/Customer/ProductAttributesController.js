const mongoose = require("mongoose");
const Model = require("../../models/index");
const HTTPError = require("../../utils/CustomError");
const responseHelper = require("../../helper/response.helper");
const Status = require("../../status");
const catchAsync = require("../../utils/catchAsync");

module.exports = {
  // Retrieve ProductAttributes user by ProductAttributesId
  getProductAttribute: catchAsync(async (req, res, next) => {
    console.log("findProductAttributesById is called");
    try {
      var ProductAttributesId = req.params.id;
      const ProductAttributes = await Model.ProductAttributes.findById(
        ProductAttributesId
      );

      // Check if the vendor user is found
      if (!ProductAttributes) {
        return res.status(404).json({ message: "Product Attribute not found" });
      }

      const message = "Product Attributes created successfully";
      res.ok(message, ProductAttributes);
    } catch (error) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, error);
    }
  }),

  // Create a new ProductAttributes
  createProductAttribute: catchAsync(async (req, res, next) => {
    console.log("createProductAttributes is called");
    try {
      var ProductAttributesData = req.body;
      const ProductAttributes = new Model.ProductAttributes(
        ProductAttributesData
      );
      await ProductAttributes.save();
      return res.ok(ProductAttributes)
    } catch (error) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, error);
    }
  }),

  // Get all ProductAttributes users with full details
  getAllProductAttributes: catchAsync(async (req, res, next) => {
    console.log("ProductAttributesdetails is called");
    try {
      // Fetch all ProductAttributess without pagination
      const ProductAttributess = await Model.ProductAttributes.find({
        isDeleted: false,
      }).sort("-_id");

      const ProductAttributesSize = ProductAttributess.length;

      const result = {
        ProductAttributes: ProductAttributess,
        count: ProductAttributesSize,
      };

      // Return a success response with the result
      return responseHelper.success(
        res,
        result,
        "ProductAttributesdetails found successfully"
      );
    } catch (error) {
      // Handle errors and return a failure response
      responseHelper.requestfailure(res, error);
    }
  }),

  updateProductAttribute: catchAsync(async (req, res, next) => {
    try {
      const ProductAttributesUserData = req.body;

      // Find the ProductAttributes by ID
      const existingProductAttributes = await Model.ProductAttributes.findById(
        ProductAttributesUserData.ProductAttributesId
      );

      // Check if the ProductAttributes exists
      if (!existingProductAttributes) {
        throw new HTTPError(Status.NOT_FOUND, "ProductAttributes not found");
      }

      // Update the ProductAttributes user with the updated data
      const result = await Model.ProductAttributes.findByIdAndUpdate(
        ProductAttributesUserData.ProductAttributesId,
        ProductAttributesUserData,
        {
          new: true,
        }
      );

      const message = "ProductAttributes status updated successfully";
      res.ok(message, result);
    } catch (err) {
      next(err); // Pass the error to the error-handling middleware
    }
  }),

  // Delete a ProductAttributes user
  declineProductAttribute: catchAsync(async (req, res, next) => {
    var ProductAttributesId = req.params.id;
    try {
      // Find the ProductAttributes by ID and update it to set isDeleted to true
      const updatedProductAttributes =
        await Model.ProductAttributes.findByIdAndUpdate(
          ProductAttributesId,
          { isDeleted: true },
          { new: true } // To return the updated document
        );

      // If ProductAttributes is not found, return a bad request response
      if (!updatedProductAttributes)
        return res.badRequest("ProductAttributes not found in our records");

      var message = "ProductAttributes deleted successfully";
      res.ok(message, updatedProductAttributes);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
};
