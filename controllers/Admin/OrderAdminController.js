const mongoose = require("mongoose");
const Model = require("../../models/index");
const HTTPError = require("../../utils/CustomError");
const responseHelper = require("../../helper/response.helper");
const OrderHelper = require("../../helper/order.helper");
const Status = require("../../status");
const catchAsync = require("../../utils/catchAsync");

module.exports = {
  getAllOrderAdmin: catchAsync(async (req, res, next) => {
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
  // Delete a Order user
  deleteOrderByAdmin: catchAsync(async (req, res, next) => {
    const OrderId = req.params.id;
    let { deletionReason } = req.body; // Get the deletion reason from the request body

    try {
      // 1. Retrieve the order details
      const orderToDelete = await Model.Order.findById(OrderId);

      if (!orderToDelete) {
        return res.badRequest("Order Not Found in our records");
      }

      // 2. If no deletion reason provided, respond with a message
      if (!deletionReason) {
        return res.badRequest("Deletion reason is required to delete the order");
      }

      // 3. Delete the order
      const deletedOrder = await Model.Order.findByIdAndDelete(OrderId);

      if (!deletedOrder) {
        return res.badRequest("Order Not Found in our records");
      }

      // 4. Store the deletion reason and some order details
      const orderDataForDeletion = {
        orderId: deletedOrder._id,
        items: deletedOrder.items,
        user: deletedOrder.user,
        // Add other fields from the order that you want to store
      };
      await Model.DeletionReason.create({
        deletionReason,
        orderData: orderDataForDeletion,
      });

      const message = `Order deleted successfully with reason: ${deletionReason}`;
      res.ok(message, deletedOrder);

    } catch (err) {
      next(new HTTPError(Status.INTERNAL_SERVER_ERROR, err));
    }
}),

};
