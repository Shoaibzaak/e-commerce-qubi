const express = require("express");
const Controller = require("../controllers/index");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Authentication = require("../policy/index");

const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
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

//post custom Family 
router.route("/createBrand").post(
//   upload.fields([
//     {
//       name: "images",
//       maxCount: 10,
//     },
//   ]),
  Authentication.AdminAuth,
  Controller.BrandController.createBrand);

//update Family
router.route("/updateBrand").post(
  Authentication.AdminAuth,
  Controller.BrandController.updateBrand);

//delete Family
router.route("/deleteBrand/:id").delete(
  Authentication.AdminAuth,
  Controller.BrandController.declineBrand);


// get Family by id
router.route("/findBrandById/:id").get(
  Authentication.AdminAuth,
  Controller.BrandController.getBrandUser);

  // get all  Familys with details
router.route("/getAllBrands").get(
  Authentication.AdminAuth,
  Controller.BrandController.getAllBrandUsers);



module.exports = router;



