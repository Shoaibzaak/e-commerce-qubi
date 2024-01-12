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
      const orderItems = req.body.items;

      if (!Array.isArray(orderItems)) {
        return res.status(400).json({ error: "Invalid request format" });
      }

      if (orderItems.length === 0) {
        return res
          .status(400)
          .json({ error: "Order must contain at least one item" });
      }

      const productsPromises = orderItems.map(async (orderItem) => {
        const { product, quantity, variationId } = orderItem;

        const productDetail = await Model.Product.findById(product);

        if (!productDetail) {
          throw new Error(`Product with this ID not found`);
        }

        const productType = productDetail.productType;

        if (productType === "variations") {
          const targetVariation = productDetail.variations.find(
            (variation) => variation._id.toString() === variationId.toString()
          //  variation.color === orderItem.color &&  // Assuming 'color' is passed in the orderItem
          //  variation.size === orderItem.size      // Assuming 'size' is passed in the orderItem
          );

          if (!targetVariation) {
            throw new Error(
              `Variation with ID ${variationId} not found for product ${product}`
            );
          }

          if (targetVariation.quantity < quantity) {
            throw new Error(
              `Insufficient quantity available for variation with ID ${variationId} for product ${product}`
            );
          }

          targetVariation.quantity -= quantity;
          await productDetail.save();

          return {
            productId: productDetail._id,
            variationId: targetVariation._id,
            quantity,
          };
        } else if (productType === "simple") {
          if (productDetail.quantity < quantity) {
            throw new Error(
              `Insufficient quantity available for product with ID ${product}`
            );
          }

          productDetail.quantity -= quantity;
          await productDetail.save();
        }

        return { productId: productDetail._id, quantity };
      });

      const products = await Promise.all(productsPromises);

      const order = new Model.Order({
        items: products.map(({ productId, variationId, quantity }) => ({
          product: productId,
          // variation: variationId,
          quantity,
        })),
        user: req.body.user,
        payment: req.body.payment,
      });

      await order.save();

      res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
      console.error(error);

      if (error.message.includes("Invalid request format")) {
        return res.status(400).json({ error: "Invalid request format" });
      }

      if (error.message.includes("Order must contain at least one item")) {
        return res
          .status(400)
          .json({ error: "Order must contain at least one item" });
      }

      if (error.message.includes("Product with this ID not found")) {
        return res.status(404).json({ error: error.message });
      }

      if (
        error.message.includes("Insufficient quantity available") ||
        error.message.includes("Variation with ID")
      ) {
        return res.status(400).json({ error: error.message });
      }

      if (error.message.includes("Variation not found")) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Internal Server Error" });
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

};
