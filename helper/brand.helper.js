
//import mongoose and models
var mongoose = require('mongoose')

var Model = require("../models/index");

//bluebird for promise
const promise = require('bluebird');

module.exports = {
    // Job seeker Brand

    createBrand: async (data) => {
        console.log("createBrandHelperFunction is called");
        const Brand= new Model.Brand(data)
        await Brand.save()
        return Brand

    },
    getBrandWithFullDetails: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getBrandModel Function called")

        const Brands = await Model.Brand.find().populate('userId')
            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit);

        const BrandSize = Brands.length

        return {
            Brands: Brands,
            count: BrandSize,
            offset: offset,
            limit: limit
        };

    },
    updateBrand: async (data) => {
        console.log("updateBrandHelperFunction is called");

        const result = await promise.all([Model.Brand.findOneAndUpdate({ _id: data.BrandId }, data, { new: true })])
        return result;

    },


    findBrandById: async (id) => {
        console.log("findBrandById HelperFunction is called", id);

        const Brand= await Model.Brand.findById(id)
        // .populate({
        //     path: 'BrandSubscription', populate: {
        //         path: "subscriptionId"
        //     },

        // })



        return Brand;


    },




};
