
//import mongoose and models
var mongoose = require('mongoose')

var Model = require("../models/index");

//bluebird for promise
const promise = require('bluebird');

module.exports = {
    // Job seeker Pin

    createFamily: async (data) => {
        console.log("createFamilyHelperFunction is called");
        const Family= new Model.Family(data)
        await Family.save()
        return Family

    },
    getPinWithFullDetails: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getFamilyModel Function called")

        const Pins = await Model.Family.find().populate('userId')
            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit);

        const PinSize = Pins.length

        return {
            Pins: Pins,
            count: PinSize,
            offset: offset,
            limit: limit
        };

    },
    updatePin: async (data) => {
        console.log("updateFamilyHelperFunction is called");

        const result = await promise.all([Model.Family.findOneAndUpdate({ _id: data.PinId }, data, { new: true })])
        return result;

    },


    findFamilyById: async (query) => {
        console.log("findPinById HelperFunction is called", query);

        const Family= await Model.Family.findOne(query.critarion)
        // .populate({
        //     path: 'PinSubscription', populate: {
        //         path: "subscriptionId"
        //     },

        // })



        return Pin;


    },




};
