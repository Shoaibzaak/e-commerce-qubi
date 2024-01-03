const express = require("express");
const Controller = require("../../controllers/index");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const Authentication = require("../../policy/index");
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check if the directory exists, if not create it
    if (!fs.existsSync("uploads/")) {
      fs.mkdirSync("uploads/");
    }
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: userStorage });

// router
//   .route("/accontVerification")
//   .post(Controller.AdminAuthController.accountVerification);
// router
//   .route("/forgetpassword")
//   .post(Controller.AdminAuthController.forgetPassword);
// router
//   .route("/changepassword")
//   .post(Authentication.UserAuth, Controller.AdminAuthController.changePassword);
// router.route("/resendOtp").post(Controller.AdminAuthController.resendOtp);
// router
//   .route("/updatePassword")
//   .post(Controller.AdminAuthController.updatePassword);

// router.route("/profile/setup").post(
//   upload.fields([
//     {
//       name: "profilePic",
//       maxCount: 1,
//     },
//     {
//       name: "resume",
//       maxCount: 1,
//     },
//   ]),
//   Controller.AuthController.setupProfile
// );
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
module.exports = router;
