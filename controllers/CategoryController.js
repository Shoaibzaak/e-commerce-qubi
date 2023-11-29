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
      var Families = await Model.Category.find()
        .skip(pageNumber * limit - limit)
        .limit(limit)
        .sort("-_id");
      const CategorySize = Families.length;
      const result = {
        Category: Families,
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

  // Update a Category user
  updateCategory: catchAsync(async (req, res, next) => {
    // Get the Category user data from the request body
    var CategoryUserData = req.body;
    try {
      // Update the Category user with the updated data
      var result = await Model.Category.findOneAndUpdate(
        { _id: CategoryUserData.CategoryId },
        CategoryUserData,
        {
          new: true,
        }
      );
      var message = "Category  status updated successfully";
      res.ok(message, result);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),

  // Delete a Category user
  declineCategory: catchAsync(async (req, res, next) => {
    var CategoryId = req.params.id;
    try {
      const CategoryUser = await Model.Category.findOneAndDelete(CategoryId);
      if (!CategoryUser)
        return res.badRequest("Category  Not Found in our records");
      var message = "Category user deleted successfully";
      res.ok(message, CategoryUser);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
};
