const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_N8bwtya9NU0jFB5ieNazsfbJ");
const Model = require("../../models/index");
const HTTPError = require("../../utils/CustomError");
const responseHelper = require("../../helper/response.helper");
const ProductHelper = require("../../helper/product.helper");
const Status = require("../../status");
const catchAsync = require("../../utils/catchAsync");
// const getDistance = require("../utils/getDistance");
const cloudUpload = require("../../cloudinary");
const Sku = require("../../helper/sku.helper");

module.exports = {

  // Retrieve Product user by ProductId
  getProductUser: catchAsync(async (req, res, next) => {
    console.log("findProductById is called");
    try {
      var ProductId = req.params.id;
      console.log(ProductId);

      var result = await ProductHelper.findProductById(ProductId);

      var message = "ProductId found successfully";
      if (result == null) {
        message = "ProductId does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  getAllProductUser: catchAsync(async (req, res, next) => {
    console.log("Productdetails is called");

    try {
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;
      if (isNaN(pageNumber) || isNaN(limit) || pageNumber < 0 || limit < 0) {
        return res.badRequest("Invalid query parameters");
      }

      const message = "Productdetails found successfully";

      const skipValue = pageNumber * limit - limit;

      if (skipValue < 0) {
        return res.badRequest("Invalid combination of pageNumber and limit.");
      }

      const filters = {};

      if (req.query.categoryIds) {
        filters.type = { $in: req.query.categoryIds.split(",") };
      }
      if (req.query.brandIds) {
        filters.brand = { $in: req.query.brandIds.split(",") };
      }
      if (req.query.colors) {
        filters.color = { $in: req.query.colors.split(",") };
      }
      if (req.query.discount) filters.discount = req.query.discount;
      if (req.query.priceMin)
        filters.price = { $gte: parseInt(req.query.priceMin) };
      if (req.query.priceMax) {
        if (!filters.price) filters.price = {};
        filters.price.$lte = parseInt(req.query.priceMax);
      }

      if (Object.keys(filters).length > 0) {
        var filterProducts = await Model.Product.find(filters)
          .skip(skipValue)
          .limit(limit)
          .sort("_id")
          .populate("type")
          .populate("brand");
      }
      const productsTotal = await Model.Product.find();
      const products = await Model.Product.find()
        .skip(skipValue)
        .limit(limit)
        .sort("_id")
        .populate("type")
        .populate("brand");
      const ProductSize = productsTotal.length;

      const result = {
        Product: Object.keys(filters).length > 0 ? filterProducts : products,
        totalProducts: ProductSize,
        limit: limit,
      };

      if (ProductSize === 0) {
        return responseHelper.requestfailure(
          res,
          "Productdetails do not exist."
        );
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),



   // Get all Brands users with full details
   getAllUserBrands: catchAsync(async (req, res, next) => {
    console.log("BrandDetailsis called");
    try {
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;

      if (isNaN(pageNumber) || isNaN(limit) || pageNumber < 0 || limit < 0) {
        // If pageNumber or limit is not a valid non-negative number, return a bad request response
        return res.badRequest("Invalid query parameters");
        // return responseHelper.badRequest(res, "Invalid query parameters.");
      }

      const message = "BrandDetails found successfully";

      const skipValue = pageNumber * limit - limit;

      if (skipValue < 0) {
        // If the calculated skip value is less than 0, return a bad request response
        return res.badRequest("Invalid combination of pageNumber and limit.");
      }
      const brandTotal = await Model.Brand.find();
      const brands = await Model.Brand.find()
        .skip(skipValue)
        .limit(limit)
        .sort("_id")

      const BrandSize = brandTotal.length;

      const result = {
        Brand: brands,
        totalBrands: BrandSize,
        limit: limit,
      };

      if (BrandSize === 0) {
        // If no products are found, return a not found response
        return responseHelper.requestfailure(
          res,
          "Branddetails do not exist."
        );
      }

      // Return a success response with status code 200
      return responseHelper.success(res, result, message);
    } catch (error) {
      // Return a failure response with status code 500
      responseHelper.requestfailure(res, error);
    }
  }),

    // Get all Categories users with full details
    getAllUserCategorys: catchAsync(async (req, res, next) => {
      console.log("CategoryDetails is called");
      try {
        const pageNumber = parseInt(req.query.pageNumber) || 0;
        const limit = parseInt(req.query.limit) || 10;
  
        if (isNaN(pageNumber) || isNaN(limit) || pageNumber < 0 || limit < 0) {
          // If pageNumber or limit is not a valid non-negative number, return a bad request response
          return res.badRequest("Invalid query parameters");
          // return responseHelper.badRequest(res, "Invalid query parameters.");
        }
  
        const message = "CategoryDetails found successfully";
  
        const skipValue = pageNumber * limit - limit;
  
        if (skipValue < 0) {
          // If the calculated skip value is less than 0, return a bad request response
          return res.badRequest("Invalid combination of pageNumber and limit.");
        }
        const categoryTotal = await Model.Category.find();
        const categories = await Model.Category.find()
          .skip(skipValue)
          .limit(limit)
          .sort("_id")
  
        const CategorySize = categoryTotal.length;
  
        const result = {
          Category: categories,
          totalCategories: CategorySize,
          limit: limit,
        };
  
        if (CategorySize === 0) {
          // If no products are found, return a not found response
          return responseHelper.requestfailure(
            res,
            "CategoryDetails do not exist."
          );
        }
  
        // Return a success response with status code 200
        return responseHelper.success(res, result, message);
      } catch (error) {
        // Return a failure response with status code 500
        responseHelper.requestfailure(res, error);
      }
    }),
};
