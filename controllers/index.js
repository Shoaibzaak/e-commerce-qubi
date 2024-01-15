module.exports = {
  AdminAuthController: require("./Admin/AdminAuthController"),
  ProductController: require("./Admin/ProductController"),
  CategoryController: require("./Admin/CategoryController"),
  BrandController: require("./Admin/BrandController"),
  OrderAdminController: require("./Admin/OrderAdminController"),



  //** matt controllers   ** //

  UserAuthController: require("./Customer/UserAuthController"),
  OrderController: require("./Customer/OrderController")
};
