const express = require("express");
const Controller = require("../../controllers/index");
const router = express.Router();
const path = require("path");
const Multer = require("multer");
const fs = require("fs");
const Authentication = require("../../policy");
const userStorage = Multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null, "./public/images");
  // },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
// const storage = new Multer.memoryStorage();


var upload = Multer({ //multer settings
  storage: userStorage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(new Error('Only images are allowed'))
    }
    callback(null, true)
  },
  limits: {
    fileSize: 1024 * 1024
  }
})

router.route("/register").post(Controller.UserAuthController.register);
router
  .route("/userAccontVerification")
  .post(Controller.UserAuthController.accountVerification);
router.route("/login").post(Controller.UserAuthController.login);
router
  .route("/userForgetpassword")
  .post(Controller.UserAuthController.forgetPassword);
router
  .route("/userChangepassword")
  .post(Authentication.UserAuth, Controller.UserAuthController.changePassword);
router.route("/userResendOtp").post(Controller.UserAuthController.resendOtp);
router
  .route("/updatePassword")
  .post(Controller.UserAuthController.updatePassword);

router
  .route("/profile/setup")
  .put(
    upload.single("profilePic"),
    Authentication.UserAuth,
    Controller.UserAuthController.profileSetup
  );
module.exports = router;
