const express = require("express");
const Controller = require("../../controllers/index");
const router = express.Router();
const path = require("path");
const Multer = require("multer");
const Authentication = require("../../policy/index");

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

//post custom vendor 
router.route("/createVendor").post(
// Authentication.AdminAuth,
upload.fields([
  {
    name: "profilePic",
    maxCount: 1,
  },
]),
  Controller.VendorController.createVendor);
  router.route("/updateVendor").put(
    // Authentication.AdminAuth,
    upload.fields([
      {
        name: "profilePic",
        maxCount: 1,
      },
    ]),
      Controller.VendorController.uploadVendorProfilePic);
    

//delete Vendor
router.route("/deleteVendor/:id").delete(
//   Authentication.AdminAuth,
  Controller.VendorController.declineVendor);


// get Vendor by id
router.route("/findVendorById/:id").get(
//   Authentication.AdminAuth,
  Controller.VendorController.getVendorUser);

  // get all  Vendors with details
router.route("/getAllVendors").get(
  // Authentication.AdminAuth,
  Controller.VendorController.getAllVendorUsers);



module.exports = router;



