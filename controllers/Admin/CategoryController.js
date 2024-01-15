const mongoose = require("mongoose");
const Model = require("../../models/index");
const HTTPError = require("../../utils/CustomError");
const responseHelper = require("../../helper/response.helper");
const CategoryHelper = require("../../helper/category.helper");
const Status = require("../../status");
const catchAsync = require("../../utils/catchAsync");

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
      // Fetch all categories without pagination
      const categorys = await Model.Category.find({isDeleted:false}).sort("-_id");

      const CategorySize = categorys.length;

      const result = {
        Category: categorys,
        count: CategorySize,
      };

      // Check if no categories are found
      if (CategorySize === 0) {
        return responseHelper.notFound(res, "Categorydetails do not exist.");
      }

      // Return a success response with the result
      return responseHelper.success(
        res,
        result,
        "Categorydetails found successfully"
      );
    } catch (error) {
      // Handle errors and return a failure response
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
        // Find the category by ID and update it to set isDeleted to true
        const updatedCategory = await Model.Category.findByIdAndUpdate(
            CategoryId,
            { isDeleted: true },
            { new: true } // To return the updated document
        );

        // If category is not found, return a bad request response
        if (!updatedCategory)
            return res.badRequest("Category not found in our records");

        var message = "Category deleted successfully";
        res.ok(message, updatedCategory);
    } catch (err) {
        throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),

  //======================Mat webiste api's
  getAllCategoryBrand: catchAsync(async (req, res, next) => {
    console.log("CategoryBranddetails is called");
    try {
      const categories = await Model.Category.find().sort("-_id");
      const brands = await Model.Brand.find().sort("-_id");

      const CategorySize = categories.length;
      const BrandSize = brands.length;

      const result = {
        Category: categories,
        Brand: brands,
        totalCategory: CategorySize,
        totalBrand: BrandSize,
      };

      if (CategorySize === 0 || BrandSize === 0) {
        // If no products are found, return a not found response
        return responseHelper.notFound(
          res,
          "Category and Brand details do not exist."
        );
      }

      const message = "CategoryBranddetails found successfully";
      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),
};
