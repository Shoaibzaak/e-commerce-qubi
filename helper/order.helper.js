
//import mongoose and models
var mongoose = require('mongoose')

var Model = require("../models/index");

//bluebird for promise
const promise = require('bluebird');

module.exports = {
    // Job seeker Order

    createOrder: async (data) => {
        console.log("createOrderHelperFunction is called");
        const Order= new Model.Order(data)
        await Order.save()
        return Order

    },
    updateOrder: async (data) => {
        console.log("updateOrderHelperFunction is called");

        const result = await promise.all([Model.Order.findOneAndUpdate({ _id: data.OrderId }, data, { new: true })])
        return result;

    },


    findOrderById: async (id) => {
        console.log("findOrderById HelperFunction is called", id);

        const Order= await Model.Order.findById(id)
        // .populate({
        //     path: 'OrderSubscription', populate: {
        //         path: "subscriptionId"
        //     },

        // })



        return Order;


    },




};
