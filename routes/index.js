module.exports = {
    /*  Admin routes */

  AdminAuthRoutes: require("./Admin/AdminAuthRoutes"),
  CategoryRoutes: require("./Admin/CategoryRoutes"),
  ProductRoutes: require("./Admin/ProductRoutes"),
  BrandRoutes: require("./Admin/BrandRoutes"),
  OrderAdminRoutes: require("./Admin/OrderAdminRoutes"),


/*   Matt routes  */   

UserAuthRoutes: require("./Customer/UserAuthRoutes"),
OrderRoutes: require("./Customer/OrderRoutes"),
ProductRoutes: require("./Customer/ProductRoutes"),
ContactRoutes: require("./Customer/ContactRoutes"),
};
