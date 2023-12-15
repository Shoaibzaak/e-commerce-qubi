const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_N8bwtya9NU0jFB5ieNazsfbJ");
const Model = require("../models/index");
const Validation = require("../validations/validation");
const Message = require("../Message");
const Services = require("../services");
const HTTPError = require("../utils/CustomError");
const responseHelper = require("../helper/response.helper");
const CategoryHelper = require("../helper/category.helper");
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
  // Retrieve Category user by CategoryId
  getCategoryUser: catchAsync(async (req, res, next) => {
    console.log("findCategoryById is called");
    try {
      var CategoryId = req.params.id;
      console.log(CategoryId);

      var result = await CategoryHelper.findCategoryById(CategoryId);

      var message = "CategoryId found successfully";
      if (result == null) {
        message = "CategoryId does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  // Create a new Category
  createCategory: catchAsync(async (req, res, next) => {
    console.log("createCategory is called");
    try {
      var CategoryData = req.body;
      //   CategoryData.images = [];
      //   if (Array.isArray(req.files.images)) {
      //     for (let i = 0; i < req.files.images.length; i++) {
      //       CategoryData.images.push(
      //         `public/images/${req.files.images[i].originalname}`
      //       );
      //     }
      //   }
      var result = await CategoryHelper.createCategory(CategoryData);

      var message = "Category created successfully";
      if (result == null) {
        message = "Category does not exist.";
      }

      return responseHelper.success(res, CategoryData, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  // Get a list of Categorys
  getCategoryList: async (req, res) => {
    console.log("getCategoryList called");
    var CategoryData = req.body;

    try {
      var result = await CategoryHelper.getCategoryList(
        CategoryData.sortproperty,
        CategoryData.sortorder,
        CategoryData.offset,
        CategoryData.limit,
        CategoryData.query
      );

      var message = "Successfully loaded";

      responseHelper.success(res, result, message);
    } catch (err) {
      responseHelper.requestfailure(res, err);
    }
  },

  // Get all Category users with full details
  getAllCategoryUsers: catchAsync(async (req, res, next) => {
    console.log("Categorydetails is called");
    try {
      // var CategoryData = req.body;

      // var result = await CategoryHelper.getCategoryWithFullDetails(CategoryData.sortproperty, CategoryData.sortorder, CategoryData.offset, CategoryData.limit, CategoryData.query);
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;
      var message = "Categorydetails found successfully";
      var categorys = await Model.Category.find()
        .skip(pageNumber * limit - limit)
        .limit(limit)
        .sort("-_id");
      const CategorySize = categorys.length;
      const result = {
        Category: categorys,
        count: CategorySize,
        limit: limit,
      };
      if (result == null) {
        message = "Categorydetails does not exist.";
      }
      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  updateCategory: catchAsync(async (req, res, next) => {
    try {
      // // Validate the incoming data
      // validateCategoryData(req.body);

      // Get the Category user data from the request body
      const categoryUserData = req.body;

      // Find the category by ID
      const existingCategory = await Model.Category.findById(
        categoryUserData.CategoryId
      );

      // Check if the category exists
      if (!existingCategory) {
        throw new HTTPError(Status.NOT_FOUND, "Category not found");
      }

      // Update the Category user with the updated data
      const result = await Model.Category.findByIdAndUpdate(
        categoryUserData.CategoryId,
        categoryUserData,
        {
          new: true,
        }
      );

      const message = "Category status updated successfully";
      res.ok(message, result);
    } catch (err) {
      next(err); // Pass the error to the error-handling middleware
    }
  }),

  // Delete a Category user
  declineCategory: catchAsync(async (req, res, next) => {
    var CategoryId = req.params.id;
    try {
      const CategoryUser = await Model.Category.findByIdAndDelete(CategoryId);
      if (!CategoryUser)
        return res.badRequest("Category  Not Found in our records");
      var message = "Category user deleted successfully";
      res.ok(message, CategoryUser);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),

  //======================Mat webiste api's
  // Get all Category users with full details
  getAllCategoryBrand: catchAsync(async (req, res, next) => {
    console.log("CategoryBranddetails is called");
    try {
      // var CategoryData = req.body;

      // var result = await CategoryHelper.getCategoryWithFullDetails(CategoryData.sortproperty, CategoryData.sortorder, CategoryData.offset, CategoryData.limit, CategoryData.query);
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;
  
      if (isNaN(pageNumber) || isNaN(limit) || pageNumber < 0 || limit < 0) {
        // If pageNumber or limit is not a valid non-negative number, return a bad request response
        return res.badRequest("Invalid query parameters");
        // return responseHelper.badRequest(res, "Invalid query parameters.");
      }
  
      const message = "CategoryBranddetails found successfully";
  
      const skipValue = pageNumber * limit - limit;
      
      if (skipValue < 0) {
        // If the calculated skip value is less than 0, return a bad request response
        return res.badRequest("Invalid combination of pageNumber and limit.");
      }
      var categoriesTotal = await Model.Category.find();
      var brandsTotal = await Model.Brand.find();
      var categorys = await Model.Category.find()
        .skip(pageNumber * limit - limit)
        .limit(limit)
        .sort("-_id");
      var brands = await Model.Brand.find()
        .skip(pageNumber * limit - limit)
        .limit(limit)
        .sort("-_id");
      const CategorySize = categoriesTotal.length;
      const BrandSize = brandsTotal.length;
      const result = {
        Category: categorys,
        Brand: brands,
        totalCategory: CategorySize,
        totalBrand: BrandSize,
        limit: limit,
      };
      if (CategorySize === 0 ||BrandSize===0) {
        // If no products are found, return a not found response
        return responseHelper.notFound(res, "Category and Brand details do not exist.");
      }
      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),
};
