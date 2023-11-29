var Routes = require("./index");
var express = require("express");
const router = express.Router();
router.use("/auth/user", Routes.UserAuthRoutes);
router.use("/familyMember", Routes.FamilyRoutes);
router.use("/product", Routes.ProductRoutes);
router.use("/category", Routes.CategoryRoutes);
module.exports = router;
