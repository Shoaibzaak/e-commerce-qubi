const express = require("express");
const Controller = require("../controllers/index");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Authentication = require("../policy/index");

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

var upload = multer({ //multer settings
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

//post custom Product 
router.route("/createProduct").post(
  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  // Authentication.UserAuth,
  Controller.ProductController.createProduct);

//update Product
router.route("/updateProduct").post(
  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  // Authentication.UserAuth,
  Controller.ProductController.updateProduct);

//delete Product
router.route("/deleteProduct/:id").delete(
  // Authentication.UserAuth,
  Controller.ProductController.declineProduct);


// get Product by id
router.route("/findProductById/:id").get(
  // Authentication.UserAuth,
  Controller.ProductController.getProductAdmin);

  // get Product by id
router.route("/findProductUserById/:id").get(
  // Authentication.UserAuth,
  Controller.ProductController.getProductUser);

  // get all  Products with details
router.route("/getAllProducts").get(
  // Authentication.UserAuth,
  Controller.ProductController.getAllProductAdmin);
  router.route("/getAllProductsUser").get(
    // Authentication.UserAuth,
    Controller.ProductController.getAllProductUser);



module.exports = router;



