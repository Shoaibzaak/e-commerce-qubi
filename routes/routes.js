var Routes = require("./index");
var express = require("express");
const router = express.Router();
router.use("/auth/user", Routes.AdminAuthRoutes);
router.use("/product", Routes.ProductRoutes);
router.use("/category", Routes.CategoryRoutes);
router.use("/brand", Routes.BrandRoutes);
router.use("/order", Routes.OrderAdminRoutes);


/*   Matt routes  */
router.use("/auth/user", Routes.UserAuthRoutes);
router.use("/user/order", Routes.OrderRoutes);
module.exports = router;
