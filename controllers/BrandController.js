const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_N8bwtya9NU0jFB5ieNazsfbJ");
const Model = require("../models/index");
const Validation = require("../validations/validation");
const Message = require("../Message");
const Services = require("../services");
const HTTPError = require("../utils/CustomError");
const responseHelper = require("../helper/response.helper");
const BrandHelper = require("../helper/brand.helper");
const Status = require("../status");
const moment = require("moment");

const fs = require("fs");
const path = require("path");
const encrypt = require("bcrypt");
const FormData = require("form-data");
const catchAsync = require("../utils/catchAsync");
const getDistance = require("../utils/getDistance");

const pushRepository = require("./pushController");
const pushRepo = new pushRepository();

const { IDVClient } = require("yoti");
const SANDBOX_CLIENT_SDK_ID = "bbb23e67-b04c-4075-97f2-105c4559d46c";

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

  // Get a list of Brands
  getBrandList: async (req, res) => {
    console.log("getBrandList called");
    var BrandData = req.body;

    try {
      var result = await BrandHelper.getBrandList(
        BrandData.sortproperty,
        BrandData.sortorder,
        BrandData.offset,
        BrandData.limit,
        BrandData.query
      );

      var message = "Successfully loaded";

      responseHelper.success(res, result, message);
    } catch (err) {
      responseHelper.requestfailure(res, err);
    }
  },

  // Get all Brand users with full details
  getAllBrandUsers: catchAsync(async (req, res, next) => {
    console.log("Branddetails is called");
    try {
      // var BrandData = req.body;

      // var result = await BrandHelper.getBrandWithFullDetails(BrandData.sortproperty, BrandData.sortorder, BrandData.offset, BrandData.limit, BrandData.query);
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;
      var message = "Branddetails found successfully";
      var brands = await Model.Brand.find()
        .skip(pageNumber * limit - limit)
        .limit(limit)
        .sort("-_id");
      const BrandSize = brands.length;
      const result = {
        Brand: brands,
        count: BrandSize,
        limit: limit,
      };
      if (result == null) {
        message = "Branddetails does not exist.";
      }
      return responseHelper.success(res, result, message);
    } catch (error) {
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
      const BrandUser = await Model.Brand.findByIdAndDelete(BrandId);
      if (!BrandUser)
        return res.badRequest("Brand  Not Found in our records");
      var message = "Brand user deleted successfully";
      res.ok(message, BrandUser);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
};
