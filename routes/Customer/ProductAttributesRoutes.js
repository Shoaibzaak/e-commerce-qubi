const express = require("express");
const Controller = require("../../controllers/index");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Authentication = require("../../policy/index");

const Storage = multer.diskStorage({
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
  storage: Storage,
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


router
  .route("/getAllProductAttributes")
  .get(Controller.ProductAttributesController.getAllProductAttributes);
  
router
  .route("/findProductAttributesById/:id")
  .get(Controller.ProductAttributesController.getProductAttribute);
  router
  .route("/findProductAttributesById/:id")
  .get(Controller.ProductAttributesController.getProductAttribute);
  router
  .route("/createProductAttribute")
  .post(Controller.ProductAttributesController.createProductAttribute);
  router
  .route("/updateProductAttribute")
  .put(Controller.ProductAttributesController.updateProductAttribute);
  router
  .route("/declineProductAttribute/:id")
  .delete(Controller.ProductAttributesController.declineProductAttribute);

module.exports = router;
