
//import mongoose and models
var mongoose = require('mongoose')

var Model = require("../models/index");

//bluebird for promise
const promise = require('bluebird');

module.exports = {
    // Job seeker User

    createUser: async (data) => {
        console.log("createUser HelperFunction is called");
        const user = new Model.User(data)
        await user.save()
        return user

    },
    getUserWithFullDetails: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getUser Model Function called")

        const users = await Model.User.find(query.critarion)

        .populate({
            path: 'userSubscription', 
            populate: {
                path: "subscriptionId"
            },
        })
            .populate('sectors.sector')
            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit);

        const userSize = users.length

        return {
            users: users,
            count: userSize,
            offset: offset,
            limit: limit
        };

    },

    getUserList: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getUser Model Function called")

        const users = await Model.User.find(query.critarion).select(query.fields/* '_id HotelName' */)

            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit);

        const userSize = users.length

        return {
            users: users,
            count: userSize,
            offset: offset,
            limit: limit
        };

    },
    getJobTemplateWithFullDetails: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getJobTemplatesdetails Model Function called")

        const jobTemplate = await Model.JobTemplate.find()
             .populate('userId')
            

            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit)
            ;

        const jobTemplatesize = jobTemplate.length

        return {
            jobTemplate: jobTemplate,
            count: jobTemplatesize,
            offset: offset,
            limit: limit
        };

    },

    updateUser: async (data) => {
        console.log("updateUser HelperFunction is called");

        const result = await promise.all([Model.User.findOneAndUpdate({ _id: data.userId }, data, { new: true })])
        return result;

    },

    updatedAdmin: async (data) => {
        console.log("updateUser HelperFunction is called");

        const result = await promise.all([Model.Admin.findOneAndUpdate({ _id: data.userId }, data, { new: true })])
        return result;

    },

    removeUser: async (data) => {
        console.log("removeUser HelperFunction is called");

        const user = await Model.User.findById(data.id);
        if (user == null) {
            var error = "user does not exists."
            return error
        }
        user.lastModifiedBy = data.lastModifiedBy
        user.isActive = false
        user.save()
        return hotel;


    },

    findUserById: async (query) => {
        console.log("findUserById HelperFunction is called");

        const user = await Model.User.findOne(query.critarion)
            .populate({
                path: 'userSubscription', populate: {
                    path: "subscriptionId"
                },
               
            })
            .populate('sectors.sector')
            .populate('applicationTemplate')


        return user;


    },

    // Business User
    createBusinessUser: async (data) => {
        console.log("createBusinessUser HelperFunction is called");
        const user = new Model.BusinessUser(data)
        await user.save()
        return user

    },
    getBusinessUserWithFullDetails: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getBusinessUserWithFullDetails Model Function called")

        const users = await Model.User.find(query.critarion)

            .populate('businessId', query.businessId)

            // .populate('lastModifiedBy', query.lastModifiedBy) // if required
            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit);

        const userSize = users.length

        return {
            users: users,
            count: userSize,
            offset: offset,
            limit: limit
        };

    },

    getBusinessUserList: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getBusinessUser Model Function called")

        const users = await Model.BusinessUser.find(query.critarion).select(query.fields/* '_id HotelName' */)

            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit);

        const userSize = users.length

        return {
            users: users,
            count: userSize,
            offset: offset,
            limit: limit
        };

    },

    updateBusinessUser: async (data) => {
        console.log("updateBusinessUser HelperFunction is called");

        const result = await promise.all([Model.BusinessUser.findOneAndUpdate({ _id: data.businessId }, data, { new: true })])
        return result;

    },

    removeBusinessUser: async (data) => {
        console.log("removeBusinessUser HelperFunction is called");

        const user = await Model.BusinessUser.findById(data.id);
        if (user == null) {
            var error = "user does not exists."
            return error
        }
        user.lastModifiedBy = data.lastModifiedBy
        user.isActive = false
        user.save()
        return user;


    },

    findBusinessUserById: async (query) => {
        console.log("findBusinessUserById HelperFunction is called");
        const user = await Model.BusinessUser.findOne(query.critarion)
            .populate('businessId', query.businessId)
        // .populate('lastModifiedBy', query.lastModifiedBy)

        return user;
    },




};
