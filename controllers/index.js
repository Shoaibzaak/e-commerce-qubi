module.exports = {
  AdminAuthController: require("./Admin/AdminAuthController"),
  FamilyController: require("./FamilyController"),
  ProductController: require("./Admin/ProductController"),
  CategoryController: require("./Admin/CategoryController"),
  BrandController: require("./Admin/BrandController"),



  //** matt controllers   ** //

  UserAuthController: require("./Customer/UserAuthController"),
  OrderController: require("./Customer/OrderController"),
};
