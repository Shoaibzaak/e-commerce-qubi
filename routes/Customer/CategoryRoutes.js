const express = require("express");
const Controller = require("../../controllers/index");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Authentication = require("../../policy/index");

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
router.route("/createCategory").post(
//   upload.fields([
//     {
//       name: "images",
//       maxCount: 10,
//     },
//   ]),
  Authentication.AdminAuth,
  Controller.CategoryController.createCategory);

//update Family
router.route("/updateCategory").post(
  Authentication.AdminAuth,
  Controller.CategoryController.updateCategory);

//delete Family
router.route("/deleteCategory/:id").delete(
  Authentication.AdminAuth,
  Controller.CategoryController.declineCategory);


// get Family by id
router.route("/findCategoryById/:id").get(
  Authentication.AdminAuth,
  Controller.CategoryController.getCategoryUser);

  // get all  Familys with details
router.route("/getAllCategories").get(
  Authentication.AdminAuth,
  Controller.CategoryController.getAllCategoryUsers);




//====================mat website api's====================>

router.route("/getAllCategoriesAndBrand").get(
  // Authentication.AdminAuth,
  Controller.CategoryController.getAllCategoryBrand);



module.exports = router;



