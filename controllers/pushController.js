const FCM = require("fcm-node");

class pushRepository {
  constructor() {
    this.fcm = new FCM(
      "AAAAPWsXDtI:APA91bFVlPZAiBQgqDH8JHfrXL-4wMyJk2dBxf08pdlEenwH_1mGue7SKpMfpyOcpidKG2VL2c1bhky-tBZZxwmcnav0d25XMC9A2Gewxb2z5fYFfDURaRG_UGmo2BKzX42iWvaaFbgj"
    );
  }
   sendUserPush({
    type,
    user,
    title,
    msg,
    postId,
    jobId,
    articleId,
    followId,
    messageId,
  }) {
    if (user.fcm_token) {
      console.log("inner Push notification", user)
      var message = {
        to: user.fcm_token,

        data: {
          type,
          title,
          body: msg,
          postId,
          jobId,
          articleId,
          followId,
          messageId,
          userId: user._id.toString(),
        },
        notification: {
          type,
          title,
          body: msg,
          postId,
          jobId,
          articleId,
          followId,
          messageId,
          userId: user._id.toString(),
        },
      };

      console.log("inner Push notification Message: ", message);

      this.fcm.send(message, function (err, response) {
        if (err) {
          console.log(err);
          return "errors";
        } else {
          console.log("Successfully sent with response: ", response);
          return "success";
        }
      });
    }
  }

  sendTopicPush({
    type,
    title,
    msg,
    user,
    postId,
    articleId,
    followId,
    messageId,
  }) {
    if (user.topicName) {
      var message = {
        to: user.topicName,

        data: {
          type,
          title,
          body: msg,
          postId,
          articleId,
          followId,
          messageId,
        },
        notification: {
          type,
          title,
          body: msg,
          postId,
          articleId,
          followId,
          messageId,
        },
      };

      this.fcm.send(message, function (err, response) {
        if (err) {
          console.log(err);
          return "errors";
        } else {
          console.log("Successfully sent with response: ", response);
          return "success";
        }
      });
    }
  }
}

module.exports = pushRepository;
