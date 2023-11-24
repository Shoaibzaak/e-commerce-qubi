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
router.route("/createFamily").post(
  // upload.fields([
  //   {
  //     name: "images",
  //     maxCount: 10,
  //   },
  // ]),
  Authentication.UserAuth,
  Controller.FamilyController.createFamily);

//update Family
router.route("/updateFamily").post(
  Authentication.UserAuth,
  Controller.FamilyController.updateFamily);

//delete Family
router.route("/deleteFamily/:id").delete(
  Authentication.UserAuth,
  Controller.FamilyController.declineFamily);


// get Family by id
router.route("/findFamilyById/:id").get(
  Authentication.UserAuth,
  Controller.FamilyController.getFamilyUser);

  // get all  Familys with details
router.route("/getAllFamilies").post(
  Authentication.UserAuth,
  Controller.FamilyController.getAllFamilyUsers);



module.exports = router;



