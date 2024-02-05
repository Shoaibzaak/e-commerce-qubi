const express = require("express");
const Controller = require("../../controllers/index");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Authentication = require("../../policy/index");

const userStorage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null, "/tmp");
  // },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({
  //multer settings
  storage: userStorage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024,
  },
});


//=======================  cutomer app side product api's will be start from this ===================    //
router
  .route("/getAllProductsUser")
  .get(Controller.ProductUserController.getAllProductUser);
  
router
  .route("/findProductUserById/:id")
  .get(Controller.ProductUserController.getProductUser);
router
  .route("/getAllUserBrands")
  .get(Controller.ProductUserController.getAllUserBrands);
  router
  .route("/getAllUserCategorys")
  .get(Controller.ProductUserController.getAllUserCategorys);

module.exports = router;
