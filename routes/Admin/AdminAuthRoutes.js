const express = require("express");
const Controller = require("../../controllers/index");
const router = express.Router();
const path = require("path");
const Multer = require("multer");
const fs = require("fs");
const Authentication = require("../../policy/index");
const AuthenticatedRole=require("../../policy/index")
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

router
  .route("/accontVerificationAdmin")
  .post(Controller.AdminAuthController.accountVerificationAdmin);
router
  .route("/registerAdmin")
  .post(Controller.AdminAuthController.registerAdmin);
router.route("/loginAdmin").post(Controller.AdminAuthController.loginAdmin);
router
  .route("/getAdminById")
  .get(Authentication.AdminAuth, Controller.AdminAuthController.getAdminById);
router
  .route("/getAllCustomers")
  .get(
    Authentication.AdminAuth,
    Controller.AdminAuthController.getAllCustomersAdmin
  );
router.route("/uploadAdminProfilePic").post(
  // Authentication.AdminAuth,
  upload.fields([
    {
      name: "profilePic",
      maxCount: 1,
    },
  ]),
  Controller.AdminAuthController.uploadAdminProfilePic
);
router.route("/updateCustomer/:id").put(
  Authentication.AdminAuth,
  Controller.AdminAuthController.updateUser
);
router.route("/getSingleUser/:id").get(
  Authentication.AdminAuth,
  Controller.AdminAuthController.getSingleUser
);
router.route("/deleteSingleUser/:id").delete(
  Authentication.AdminAuth,
  Controller.AdminAuthController.deleteUser
);
router.route("/forgetAdminPassword").post(
  Controller.AdminAuthController.forgetAdminPassword
);
router.route("/updateAdminPassword").put(
  Controller.AdminAuthController.updateAdminPassword
);
router.route("/resendAdminOtp").post(
  Controller.AdminAuthController.resendAdminOtp
);
router.route("/changeDashboardPassword").post(
  Authentication.AdminAuth,
  Controller.AdminAuthController.changeAdminPassword
);
module.exports = router;
