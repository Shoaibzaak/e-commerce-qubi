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
      console.log(ProductData, "ProductData");
      const files = req.files.images;
      // Validate and set unique SKUs
      if (ProductData.productType === "simple") {
        if (!ProductData.sku) {
          ProductData.sku = await Sku.generateUniqueSKU();
        }
      } else if (ProductData.productType === "variations") {
        for (let variation of ProductData.variations) {
          if (!variation.sku) {
            variation.sku = await Sku.generateUniqueSKU();
          }
        }
      } else {
        return res.status(400).json({ error: "Invalid productType" });
      }

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
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;

      if (isNaN(pageNumber) || isNaN(limit) || pageNumber < 0 || limit < 0) {
        // If pageNumber or limit is not a valid non-negative number, return a bad request response
        return res.badRequest("Invalid query parameters");
        // return responseHelper.badRequest(res, "Invalid query parameters.");
      }

      const message = "Productdetails found successfully";

      const skipValue = pageNumber * limit - limit;

      if (skipValue < 0) {
        // If the calculated skip value is less than 0, return a bad request response
        return res.badRequest("Invalid combination of pageNumber and limit.");
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
        Product: products,
        totalProducts: ProductSize,
        limit: limit,
      };

      if (ProductSize === 0) {
        // If no products are found, return a not found response
        return responseHelper.requestfailure(
          res,
          "Productdetails do not exist."
        );
      }

      // Return a success response with status code 200
      return responseHelper.success(res, result, message);
    } catch (error) {
      // Return a failure response with status code 500
      responseHelper.requestfailure(res, error);
    }
  }),
  getAllProductUser: catchAsync(async (req, res, next) => {
    console.log("Productdetails is called");

    try {
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;

      if (isNaN(pageNumber) || isNaN(limit) || pageNumber < 0 || limit < 0) {
        // If pageNumber or limit is not a valid non-negative number, return a bad request response
        return res.badRequest("Invalid query parameters");
        // return responseHelper.badRequest(res, "Invalid query parameters.");
      }

      const message = "Productdetails found successfully";

      const skipValue = pageNumber * limit - limit;

      if (skipValue < 0) {
        // If the calculated skip value is less than 0, return a bad request response
        return res.badRequest("Invalid combination of pageNumber and limit.");
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
        Product: products,
        totalProducts: ProductSize,
        limit: limit,
      };

      if (ProductSize === 0) {
        // If no products are found, return a not found response
        return responseHelper.requestfailure(
          res,
          "Productdetails do not exist."
        );
      }

      // Return a success response with status code 200
      return responseHelper.success(res, result, message);
    } catch (error) {
      // Return a failure response with status code 500
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