module.exports = {
  AdminAuthController: require("./Admin/AdminAuthController"),
  ProductController: require("./Admin/ProductController"),
  CategoryController: require("./Admin/CategoryController"),
  BrandController: require("./Admin/BrandController"),
  OrderAdminController: require("./Admin/OrderAdminController"),
  VendorController: require("./Admin/VendorController"),


  //** matt controllers   ** //

  UserAuthController: require("./Customer/UserAuthController"),
  OrderController: require("./Customer/OrderController"),
  ContactController: require("./Customer/ContactController"),
  ProductUserController: require("./Customer/ProductUserController"),
  ProductAttributesController: require("./Customer/ProductAttributesController")
};
