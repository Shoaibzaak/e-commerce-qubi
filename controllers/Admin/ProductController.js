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
  updateFeatureProduct: catchAsync(async (req, res, next) => {
    console.log("updateWishlistById is called");
    try {
      var ProductId = req.params.id;

      // Find the product by ID
      var product = await ProductHelper.findProductById(ProductId);

      // If product is not found
      if (!product) {
        return responseHelper.error(res, null, "ProductId does not exist.");
      }

      // Toggle the value of isWhished
      product.isWhished = !product.isWhished;

      // Save the updated product
      await product.save();

      var message = product.isWhished
        ? "Added to wishlist successfully"
        : "Removed from wishlist successfully";
      return responseHelper.success(res, product, message);
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
      const files = req.files;
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

      if (req.files) {
        const cloudUploadPromises = files.map(async (file) => {
          try {
            const { path } = file;
            const newPath = await cloudUpload.cloudinaryUpload(path);
            ProductData.images.push(newPath);
          } catch (uploadError) {
            console.error("Error uploading image to Cloudinary:", uploadError);
            // Handle the error as needed (e.g., log it, send a response, etc.)
          }
        });

        // Wait for all Cloudinary uploads to complete before proceeding
        await Promise.all(cloudUploadPromises);
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
        .sort("-_id")
        .populate("brand")
        .populate({
          path: "typeAndChildCategory.type",
          model: "Category",
          select: "categoryName _id",
        })
        .populate({
          path: "typeAndChildCategory.childCategories",
          model: "Category",
          select: "categoryName _id",
        });

      const ProductSize = productsTotal.length;

      const result = {
        Product: products,
        totalProducts: ProductSize,
        limit: limit,
      };

      // Return a success response with status code 200
      return responseHelper.success(res, result, message);
    } catch (error) {
      // Return a failure response with status code 500
      responseHelper.requestfailure(res, error);
    }
  }),
  getAllWhishList: catchAsync(async (req, res, next) => {
    console.log("WhisListdetails is called");
    try {
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;

      if (isNaN(pageNumber) || isNaN(limit) || pageNumber < 0 || limit < 0) {
        // If pageNumber or limit is not a valid non-negative number, return a bad request response
        return res.badRequest("Invalid query parameters");
        // return responseHelper.badRequest(res, "Invalid query parameters.");
      }

      const message = "WhishListdetails found successfully";

      const skipValue = pageNumber * limit - limit;

      if (skipValue < 0) {
        // If the calculated skip value is less than 0, return a bad request response
        return res.badRequest("Invalid combination of pageNumber and limit.");
      }
      const productsTotal = await Model.Product.find({ isWhished: true });
      const products = await Model.Product.find({ isWhished: true })
        .skip(skipValue)
        .limit(limit)
        .sort("_id")
        .populate({
          path: "typeAndChildCategory.type",
          model: "Category",
          select: "categoryName _id",
        })
        .populate({
          path: "typeAndChildCategory.childCategories",
          model: "Category",
          select: "categoryName _id",
        })
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
          "WhishListdetails do not exist."
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
          .populate("brand")
          .populate({
            path: "typeAndChildCategory.type",
            model: "Category",
            select: "categoryName _id",
          })
          .populate({
            path: "typeAndChildCategory.childCategories",
            model: "Category",
            select: "categoryName _id",
          });
      }
      const productsTotal = await Model.Product.find();
      const products = await Model.Product.find()
        .skip(skipValue)
        .limit(limit)
        .sort("_id")
        .populate("brand")
        .populate({
          path: "typeAndChildCategory.type",
          model: "Category",
          select: "categoryName _id",
        })
        .populate({
          path: "typeAndChildCategory.childCategories",
          model: "Category",
          select: "categoryName _id",
        });
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

  // Update a Product user
  updateProduct: catchAsync(async (req, res, next) => {
    try {
      console.log("updateProduct has been called");
      const ProductUserData = req.body;
      const files = req.files.images;

      if (files && files.length > 0) {
        for (const file of files) {
          const { path } = file;
          const newPath = await cloudUpload.cloudinaryUpload(path);
          // Find the product by id
          const product = await Model.Product.findById({ _id: ProductUserData.ProductId });
          if (!product) {
            throw new HTTPError(Status.NOT_FOUND, "Product not found");
          }

          // Check if the product has images array
          if (!product.images) {
            product.images = [];
          }

          // Update the image at specific index or push new image if index is not provided
          if (
            req.body.index !== undefined &&
            req.body.index < product.images.length
          ) {
            product.images[req.body.index] = newPath;
          } else {
            product.images.push(newPath);
          }

          // Save the updated product
          await product.save();
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
        .sort("_id");

      const BrandSize = brandTotal.length;

      const result = {
        Brand: brands,
        totalBrands: BrandSize,
        limit: limit,
      };

      if (BrandSize === 0) {
        // If no products are found, return a not found response
        return responseHelper.requestfailure(res, "Branddetails do not exist.");
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
        .sort("_id");

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
  getAllProductVendor: catchAsync(async (req, res, next) => {
    console.log("Productdetails is called");
    try {
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;

      // Extract user ID from request parameters, adjust this based on your actual route structure
      const userId = req.params.userId;

      if (
        isNaN(pageNumber) ||
        isNaN(limit) ||
        pageNumber < 0 ||
        limit < 0 ||
        !userId
      ) {
        return res.badRequest("Invalid query parameters");
      }

      const message = "Productdetails found successfully";

      const skipValue = pageNumber * limit - limit;

      if (skipValue < 0) {
        return res.badRequest("Invalid combination of pageNumber and limit.");
      }

      // Modify the query to filter products by userId
      const productsTotal = await Model.Product.find({ userId: userId });
      const products = await Model.Product.find({ userId: userId })
        .skip(skipValue)
        .limit(limit)
        .sort("-_id")
        .populate("brand")
        .populate({
          path: "typeAndChildCategory.type",
          model: "Category",
          select: "categoryName _id",
        })
        .populate({
          path: "typeAndChildCategory.childCategories",
          model: "Category",
          select: "categoryName _id",
        });

      const productSize = productsTotal.length;

      const result = {
        Product: products,
        totalProducts: productSize,
        limit: limit,
      };

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),
  updateProfileImage: catchAsync(async (req, res, next) => {
    try {
      console.log("updateImage has been called");
      const { id } = req.params;
      const files = req.files.images;

      // Check if files (images) exist
      if (files && files.length > 0) {
        for (const file of files) {
          const { path } = file;
          const newPath = await cloudUpload.cloudinaryUpload(path);
          // Find the product by id
          const product = await Model.Product.findById(id);
          if (!product) {
            throw new HTTPError(Status.NOT_FOUND, "Product not found");
          }

          // Check if the product has images array
          if (!product.images) {
            product.images = [];
          }

          // Update the image at specific index or push new image if index is not provided
          if (
            req.body.index !== undefined &&
            req.body.index < product.images.length
          ) {
            product.images[req.body.index] = newPath;
          } else {
            product.images.push(newPath);
          }

          // Save the updated product
          await product.save();
        }
      }

      const updatedProduct = await Model.Product.findById(id);

      if (!updatedProduct) {
        throw new HTTPError(Status.NOT_FOUND, "Product not found");
      }

      const message = "Product status updated successfully";
      res.ok(message, updatedProduct);
    } catch (err) {
      next(err); // Pass the error to the next middleware for centralized error handling
    }
  }),
};
