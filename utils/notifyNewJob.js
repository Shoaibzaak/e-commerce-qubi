const mongoose = require("mongoose");
const Model = require("../models/index");
const getDistance = require("./getDistance");

const notifyNewJob = async (job, users, businessUserId) => {
  let inviteUsers;
  if(users && users.length == 0) {
    inviteUsers = await Model.User.find({
      isActive: true,
      // sectors: { sector: job.sector, experience: { $gte: job.experience } },
      sectors: {
       $elemMatch: { sector: mongoose.Types.ObjectId(job.sector), experience: { $gte: job.experience } },
      },
    });
    inviteUsers = inviteUsers.filter((user) => {
      const distance = getDistance(
        user.location.coordinates[0],
        user.location.coordinates[1],
        job.location.coordinates[0],
        job.location.coordinates[1]
      );
      if (distance <= user.radius) return true;
      return false;
    });
  } else {
    inviteUsers = users.forEach(async(user) => {
      await Model.User.find({
        _id: user,
        isActive: true,
      });
    })

  }
  if(inviteUsers && inviteUsers.length > 0){
    inviteUsers = inviteUsers.forEach(async (user) => {
      const notification = new Model.Notification({
        senderId: businessUserId,
        recipientId: user._id,
        senderModelType: "BusinessUser",
        recipientModelType: "User",
        message: "has posted a new job.",
        notificationType: "JOB",
        jobId: job._id,
      });
      await notification.save();
    });
  }

};

module.exports = notifyNewJob;
