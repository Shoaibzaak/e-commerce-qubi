const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_N8bwtya9NU0jFB5ieNazsfbJ");
const Model = require("../../models/index");
const HTTPError = require("../../utils/CustomError");
const responseHelper = require("../../helper/response.helper");
const OrderHelper = require("../../helper/order.helper");
const Status = require("../../status");
const catchAsync = require("../../utils/catchAsync");
// const getDistance = require("../utils/getDistance");
const cloudUpload = require("../../cloudinary");
const Sku = require("../../helper/sku.helper");

module.exports = {
  // Retrieve Order user by OrderId
  getOrderUser: catchAsync(async (req, res, next) => {
    console.log("findOrderById is called");
    try {
      var OrderId = req.params.id;
      console.log(OrderId);

      var result = await OrderHelper.findOrderById(OrderId);

      var message = "OrderId found successfully";
      if (result == null) {
        message = "OrderId does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),
  // Create a new Order
  createOrder: catchAsync(async (req, res, next) => {
    console.log("createOrder is called");
    try {
      const { items, user, payment } = req.body;
      const newOrder = new Model.Order({
        items: items.map((item) => ({
          product: item.product, // Assuming item.product is the product ID
          quantity: item.quantity || 1, // Default to 1 if quantity is not provided
        })),
        user,
        payment,
      });

      const savedOrder = await newOrder.save();

      res.status(200).json(savedOrder);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  getAllOrderUser: catchAsync(async (req, res, next) => {
    console.log("Orderdetails is called");

    try {
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;

      if (isNaN(pageNumber) || isNaN(limit) || pageNumber < 0 || limit < 0) {
        // If pageNumber or limit is not a valid non-negative number, return a bad request response
        return res.badRequest("Invalid query parameters");
        // return responseHelper.badRequest(res, "Invalid query parameters.");
      }

      const message = "Orderdetails found successfully";

      const skipValue = pageNumber * limit - limit;

      if (skipValue < 0) {
        // If the calculated skip value is less than 0, return a bad request response
        return res.badRequest("Invalid combination of pageNumber and limit.");
      }
      const OrdersTotal = await Model.Order.find();
      const Orders = await Model.Order.find()
        .skip(skipValue)
        .limit(limit)
        .sort("_id")
        .populate({
          path: 'items.product',   // the field in the Order schema where the product ID is stored
          model: 'product' ,     // the name of the model (as defined in mongoose.model()) for the Product
          // Optionally, if you want to select specific fields from the Product model:
          select: 'name images price description'
        });

      const OrderSize = OrdersTotal.length;

      const result = {
        Order: Orders,
        totalOrders: OrderSize,
        limit: limit,
      };

      if (OrderSize === 0) {
        // If no Orders are found, return a not found response
        return responseHelper.requestfailure(res, "Orderdetails do not exist.");
      }

      // Return a success response with status code 200
      return responseHelper.success(res, result, message);
    } catch (error) {
      // Return a failure response with status code 500
      responseHelper.requestfailure(res, error);
    }
  }),

  // Update a Order user
  updateOrder: catchAsync(async (req, res, next) => {
    try {
      console.log("updateOrder has been called");
      const OrderUserData = req.body;
      const files = req.files.images;

      // Check if files (images) exist
      if (files && files.length > 0) {
        OrderUserData.images = [];

        for (const file of files) {
          const { path } = file;
          const newPath = await cloudUpload.cloudinaryUpload(path);
          OrderUserData.images.push(newPath);
        }
      }
      const updatedOrder = await Model.Order.findOneAndUpdate(
        { _id: OrderUserData.OrderId },
        OrderUserData,
        { new: true }
      );

      if (!updatedOrder) {
        throw new HTTPError(Status.NOT_FOUND, "Order not found");
      }

      const message = "Order status updated successfully";
      res.ok(message, updatedOrder);
    } catch (err) {
      next(err); // Pass the error to the next middleware for centralized error handling
    }
  }),

  // Delete a Order user
  declineOrder: catchAsync(async (req, res, next) => {
    var OrderId = req.params.id;
    try {
      const OrderUser = await Model.Order.findByIdAndDelete(OrderId);
      if (!OrderUser) return res.badRequest("Order  Not Found in our records");
      var message = "Order user deleted successfully";
      res.ok(message, OrderUser);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
};
