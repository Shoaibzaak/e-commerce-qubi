const mongoose = require("mongoose");
const Model = require("../models/index");
const pushRepository = require("../controllers/pushController");
const pushRepo = new pushRepository();
const moment = require("moment");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected");

    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });

    socket.on("sendMessage", async (message) => {
      console.log(message);
      try {
        Promise.all([
          Model.User.findOne({ _id: message.sentTo }),
          Model.BusinessUser.findOne({ _id: message.sentTo }),
          Model.Admin.findOne({ _id: message.sentTo }),
          Model.User.findOne({ _id: message.sentBy }),
          Model.BusinessUser.findOne({ _id: message.sentBy }),
          Model.Admin.findOne({ _id: message.sentBy }),
        ]).then(async ([user1, business1, admin1, user2, business2, admin2]) => {
          message.date = moment().valueOf();

          let sentTo, sentBy;
          let sentToModelType, sentByModelType;

          if (user1) {
            sentTo = user1;
            sentToModelType = 'User';
          } else if (business1) {
            sentTo = business1;
            sentToModelType = 'Business';
          } else if (admin1) {
            sentTo = admin1;
            sentToModelType = 'Admin';
          }

          if (user2) {
            sentBy = user2;
            sentByModelType = 'User';
          } else if (business2) {
            sentBy = business2;
            sentByModelType = 'Business';
          } else if (admin2) {
            sentBy = admin2;
            sentByModelType = 'Admin';
          }

          message.sentToModelType = sentToModelType;
          message.sentByModelType = sentByModelType;

          let newMessage = new Model.Message(message);
          await newMessage.save();

          const populatedMessage = await Model.Message.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(newMessage._id) } },

            {
              $lookup: {
                from: 'users',
                localField: 'sentBy',
                foreignField: '_id',
                as: 'sentBy_user'
              }
            },
      
            {
              $lookup: {
                from: 'businessusers',
                localField: 'sentBy',
                foreignField: '_id',
                as: 'sentBy_business'
              }
            },
      
            {
              $lookup: {
                from: 'users',
                localField: 'sentTo',
                foreignField: '_id',
                as: 'sentTo_user'
              }
            },
      
            {
              $lookup: {
                from: 'businessusers',
                localField: 'sentTo',
                foreignField: '_id',
                as: 'sentTo_business'
              }
            },
      
            {
              $addFields: {
                sentTo: {
                  $cond: {
                    if: { $gt: [{ $size: '$sentTo_user' }, 0] },
                    then: { $arrayElemAt: ['$sentTo_user', 0] },
                    else: { $arrayElemAt: ['$sentTo_business', 0] }
                  }
                },
                sentBy: {
                  $cond: {
                    if: { $gt: [{ $size: '$sentBy_user' }, 0] },
                    then: { $arrayElemAt: ['$sentBy_user', 0] },
                    else: { $arrayElemAt: ['$sentBy_business', 0] }
                  }
                }
              }
            },
      
            { $project: { _id: 0, sentTo_user: 0, sentBy_user: 0, sentTo_business: 0, sentBy_business: 0 ,sentBy_admin:0} },
            { $sort: { createdAt: -1 } }
       
          ]);

          const populatedMessageObject = populatedMessage[0];

          pushRepo.sendUserPush({
            type: "MESSAGE",
            user: sentTo,
            title: "New Message",
            msg: `${sentBy.name || sentBy.fullname || "Someone"} has sent you a message`,
            messageId: populatedMessageObject._id,
          });

          const listenId1 = `${sentTo._id}${sentBy._id}`;
          const listenId2 = `${sentBy._id}${sentTo._id}`;
          io.emit(listenId1, populatedMessageObject);
          io.emit(listenId2, populatedMessageObject);

        });
      } catch (error) {
        console.log("some thing went wrong");
      }
    });
    socket.on("sendAdminMessage", async (message) => {
      console.log(message);
      try {
        Promise.all([
          Model.User.findOne({ _id: message.sentTo }),
          Model.BusinessUser.findOne({ _id: message.sentTo }),
          Model.Admin.findOne({ _id: message.sentTo }),
          Model.User.findOne({ _id: message.sentBy }),
          Model.BusinessUser.findOne({ _id: message.sentBy }),
          Model.Admin.findOne({ _id: message.sentBy }),
        ]).then(async ([user1, business1, admin1, user2, business2, admin2]) => {
          message.date = moment().valueOf();

          let sentTo, sentBy;
          let sentToModelType, sentByModelType;

          if (user1) {
            sentTo = user1;
            sentToModelType = 'User';
          } else if (business1) {
            sentTo = business1;
            sentToModelType = 'Business';
          } else if (admin1) {
            sentTo = admin1;
            sentToModelType = 'Admin';
          }

          if (user2) {
            sentBy = user2;
            sentByModelType = 'User';
          } else if (business2) {
            sentBy = business2;
            sentByModelType = 'Business';
          } else if (admin2) {
            sentBy = admin2;
            sentByModelType = 'Admin';
          }

          message.sentToModelType = sentToModelType;
          message.sentByModelType = sentByModelType;

          let newMessage = new Model.Message(message);
          await newMessage.save();

          const populatedMessage = await Model.Message.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(newMessage._id) } },

            {
              $lookup: {
                from: 'users',
                localField: 'sentBy',
                foreignField: '_id',
                as: 'sentBy_user'
              }
            },
      
            {
              $lookup: {
                from: 'businessusers',
                localField: 'sentBy',
                foreignField: '_id',
                as: 'sentBy_business'
              }
            },
      
            {
              $lookup: {
                from: 'users',
                localField: 'sentTo',
                foreignField: '_id',
                as: 'sentTo_user'
              }
            },
      
            {
              $lookup: {
                from: 'businessusers',
                localField: 'sentTo',
                foreignField: '_id',
                as: 'sentTo_business'
              }
            },
            {
              $lookup: {
                  from: 'admins',
                  localField: 'sentBy',
                  foreignField: '_id',
                  as: 'sentBy_admin',
              },
          },
          {
            $lookup: {
              from: 'admins',
              localField: 'sentTo',
              foreignField: '_id',
              as: 'sentTo_admin'
            }
          },
      
            {
              $addFields: {
                sentTo: {
                  $cond: {
                    if: { $gt: [{ $size: '$sentTo_user' }, 0] },
                    then: { $arrayElemAt: ['$sentTo_user', 0] },
                    else: { $arrayElemAt: ['$sentTo_business', 0]},
                    else: { $arrayElemAt: ['$sentTo_admin', 0]}
                  
                  }
                },
                sentBy: {
                  $cond: {
                    if: { $gt: [{ $size: '$sentBy_admin' }, 0] },
                    then: { $arrayElemAt: ['$sentBy_admin', 0] },
                    else: { $arrayElemAt: ['$sentBy_business', 0]},
                    else: { $arrayElemAt: ['$sentBy_user', 0]}
                  }
                }
              }
            },
      
            { $project: { _id: 0, sentTo_user: 0, sentBy_user: 0, sentTo_admin:0,sentTo_business: 0, sentBy_business: 0 ,sentBy_admin:0} },
            { $sort: { createdAt: -1 } }
       
          ]);

          const populatedMessageObject = populatedMessage[0];

          pushRepo.sendUserPush({
            type: "MESSAGE",
            user: sentTo,
            title: "New Message",
            msg: `${sentBy.name || sentBy.fullname || "Someone"} has sent you a message`,
            messageId: populatedMessageObject._id,
          });

          const listenId1 = `${sentTo._id}${sentBy._id}`;
          const listenId2 = `${sentBy._id}${sentTo._id}`;
          io.emit(listenId1, populatedMessageObject);
          io.emit(listenId2, populatedMessageObject);

        });
      } catch (error) {
        console.log("some thing went wrong");
      }
    });
  });
};
