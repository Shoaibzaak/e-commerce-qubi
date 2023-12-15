const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_N8bwtya9NU0jFB5ieNazsfbJ");
const Model = require("../models/index");
const Validation = require("../validations/validation");
const Message = require("../Message");
const Services = require("../services");
const HTTPError = require("../utils/CustomError");
const responseHelper = require("../helper/response.helper");
const ProductHelper = require("../helper/product.helper");
const Status = require("../status");
const moment = require("moment");

const fs = require("fs");
const path = require("path");
const encrypt = require("bcrypt");
const FormData = require("form-data");
const catchAsync = require("../utils/catchAsync");
const getDistance = require("../utils/getDistance");
const cloudUpload = require("../cloudinary");
const pushRepository = require("./pushController");
const pushRepo = new pushRepository();

const { IDVClient } = require("yoti");
const SANDBOX_CLIENT_SDK_ID = "bbb23e67-b04c-4075-97f2-105c4559d46c";

module.exports = {
  // Retrieve Product user by ProductId
  getProductAdmin: catchAsync(async (req, res, next) => {
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
  // Create a new Product
  createProduct: catchAsync(async (req, res, next) => {
    console.log("createProduct is called");
    try {
      var ProductData = req.body;
      const files = req.files.images;
      ProductData.images = [];
      // if (Array.isArray(req.files.images)) {
      //   for (let i = 0; i < req.files.images.length; i++) {
      //     ProductData.images.push(
      //       `public/images/${req.files.images[i].originalname}`
      //     );
      //   }
      // }
      if (req.files.images) {
        for (const file of files) {
          const { path } = file;
          const newPath = await cloudUpload.cloudinaryUpload(path);
          ProductData.images.push(newPath);
        }
      }
      var result = await ProductHelper.createProduct(ProductData);

      var message = "Product created successfully";
      if (result == null) {
        message = "Product does not exist.";
      }

      return responseHelper.success(res, ProductData, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  // Get a list of Products
  getProductList: async (req, res) => {
    console.log("getProductList called");
    var ProductData = req.body;

    try {
      var result = await ProductHelper.getProductList(
        ProductData.sortproperty,
        ProductData.sortorder,
        ProductData.offset,
        ProductData.limit,
        ProductData.query
      );

      var message = "Successfully loaded";

      responseHelper.success(res, result, message);
    } catch (err) {
      responseHelper.requestfailure(res, err);
    }
  },

  // Get all Product users with full details
  getAllProductAdmin: catchAsync(async (req, res, next) => {
    console.log("Productdetails is called");
    try {
      // var ProductData = req.body;

      // var result = await ProductHelper.getProductWithFullDetails(ProductData.sortproperty, ProductData.sortorder, ProductData.offset, ProductData.limit, ProductData.query);
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;
      var message = "Productdetails found successfully";
      var products = await Model.Product.find()
        .skip(pageNumber * limit - limit)
        .limit(limit)
        .sort("_id")
        .populate("type");
      const ProductSize = products.length;
      const result = {
        Product: products,
        count: ProductSize,
        limit: limit,
      };
      if (result == null) {
        message = "Productdetails does not exist.";
      }
      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),
  // Get all Product users with full details
  getAllProductUser: catchAsync(async (req, res, next) => {
    console.log("Productdetails is called");
    try {
      // var ProductData = req.body;

      // var result = await ProductHelper.getProductWithFullDetails(ProductData.sortproperty, ProductData.sortorder, ProductData.offset, ProductData.limit, ProductData.query);
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;
      var message = "Productdetails found successfully";
      var products = await Model.Product.find()
        .skip(pageNumber * limit - limit)
        .limit(limit)
        .sort("_id")
        .populate("type");
      const ProductSize = products.length;
      const result = {
        Product: products,
        totalProducts: ProductSize,
        limit: limit,
      };
      if (result == null) {
        message = "Productdetails does not exist.";
      }
      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),
  // Update a Product user
  updateProduct: catchAsync(async (req, res, next) => {
    try {
      console.log("updateProduct has been called");
      const ProductUserData = req.body;
      const files = req.files.images;

      // Check if files (images) exist
      if (files && files.length > 0) {
        ProductUserData.images = [];

        for (const file of files) {
          const { path } = file;
          const newPath = await cloudUpload.cloudinaryUpload(path);
          ProductUserData.images.push(newPath);
        }
      }
      const updatedProduct = await Model.Product.findOneAndUpdate(
        { _id: ProductUserData.ProductId },
        ProductUserData,
        { new: true }
      );

      if (!updatedProduct) {
        throw new HTTPError(Status.NOT_FOUND, "Product not found");
      }

      const message = "Product status updated successfully";
      res.ok(message, updatedProduct);
    } catch (err) {
      next(err); // Pass the error to the next middleware for centralized error handling
    }
  }),

  // Delete a Product user
  declineProduct: catchAsync(async (req, res, next) => {
    var ProductId = req.params.id;
    try {
      const ProductUser = await Model.Product.findByIdAndDelete(ProductId);
      if (!ProductUser)
        return res.badRequest("Product  Not Found in our records");
      var message = "Product user deleted successfully";
      res.ok(message, ProductUser);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
};
