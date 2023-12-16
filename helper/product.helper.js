
//import mongoose and models
var mongoose = require('mongoose')

var Model = require("../models/index");

//bluebird for promise
const promise = require('bluebird');

module.exports = {
    // Job seeker Product

    createProduct: async (data) => {
        console.log("createProductHelperFunction is called");
        const Product= new Model.Product(data)
        await Product.save()
        return Product

    },
    getProductWithFullDetails: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getProductModel Function called")

        const Products = await Model.Product.find().populate('userId')
            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit);

        const ProductSize = Products.length

        return {
            Products: Products,
            count: ProductSize,
            offset: offset,
            limit: limit
        };

    },
    updateProduct: async (data) => {
        console.log("updateProductHelperFunction is called");

        const result = await promise.all([Model.Product.findOneAndUpdate({ _id: data.ProductId }, data, { new: true })])
        return result;

    },


    findProductById: async (id) => {
        console.log("findProductById HelperFunction is called", id);

        const Product= await Model.Product.findById(id)
        .populate("type")
        .populate("brand");



        return Product;


    },




};
