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

var upload = multer({ //multer settings
  storage: userStorage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(new Error('Only jpg ,png ,jpeg ,gif  are allowed'))
    }
    callback(null, true)
  },
  limits: {
    fileSize: 1024 * 1024
  }
})

  router.route("/getAllOrderAdmin").get(
    Authentication.AdminAuth,
    Controller.OrderAdminController.getAllOrderAdmin);

    //delete Order
router.route("/deleteOrder/:id").delete(
  // Authentication.AdminAuth,
  Controller.OrderAdminController.deleteOrderByAdmin);

  




module.exports = router;



