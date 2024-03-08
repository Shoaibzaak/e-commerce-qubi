var Routes = require("./index");
var express = require("express");
const router = express.Router();
router.use("/auth/user", Routes.AdminAuthRoutes);
router.use("/product", Routes.ProductRoutes);
router.use("/category", Routes.CategoryRoutes);
router.use("/brand", Routes.BrandRoutes);
router.use("/order", Routes.OrderAdminRoutes);
router.use("/vendor", Routes.VendorRoutes);


/*   Matt routes  */
router.use("/auth/user", Routes.UserAuthRoutes);
router.use("/user/order", Routes.OrderRoutes);
router.use("/user/product", Routes.ProductUserRoutes);
router.use("/user/contact", Routes.ContactRoutes);
module.exports = router;
