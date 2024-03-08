module.exports = {
    /*  Admin routes */

  AdminAuthRoutes: require("./Admin/AdminAuthRoutes"),
  CategoryRoutes: require("./Admin/CategoryRoutes"),
  ProductRoutes: require("./Admin/ProductRoutes"),
  BrandRoutes: require("./Admin/BrandRoutes"),
  OrderAdminRoutes: require("./Admin/OrderAdminRoutes"),
  VendorRoutes: require("./Admin/VendorRoutes"),


/*   Matt routes  */   

UserAuthRoutes: require("./Customer/UserAuthRoutes"),
OrderRoutes: require("./Customer/OrderRoutes"),
ProductUserRoutes: require("./Customer/ProductUserRoutes"),
ContactRoutes: require("./Customer/ContactRoutes")
};
