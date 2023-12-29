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
        return res.badRequest("Invalid query parameters");
      }

      const message = "Orderdetails found successfully";

      const skipValue = pageNumber * limit - limit;
      if (skipValue < 0) {
        return res.badRequest("Invalid combination of pageNumber and limit.");
      }

      // Aggregation pipeline to get orders with populated product details, payment, status, and item count
      const Orders = await Model.Order.aggregate([
        { $skip: skipValue },
        { $limit: limit },
        {
          $lookup: {
            from: "products", // Assuming your Product model is named 'Product' in Mongoose and collection name is 'products'
            localField: "items.product",
            foreignField: "_id",
            as: "itemDetails",
          },
        },
        {
          $project: {
            _id: 1,
            payment: 1,
            status: 1,
            itemCount: { $size: "$items" },
            itemDetails: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $mergeObjects: [
                    "$$item",
                    {
                      productDetails: {
                        $arrayElemAt: [
                          {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$itemDetails",
                                  as: "detail",
                                  cond: {
                                    $eq: ["$$detail._id", "$$item.product"],
                                  },
                                },
                              },
                              as: "filtered",
                              in: {
                                name: "$$filtered.name",
                                images: "$$filtered.images",
                                description: "$$filtered.description",
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ]);

      const OrderSize = await Model.Order.countDocuments();

      const result = {
        Order: Orders,
        totalOrders: OrderSize,
        limit: limit,
      };

      if (OrderSize === 0) {
        return responseHelper.requestfailure(res, "Orderdetails do not exist.");
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
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
