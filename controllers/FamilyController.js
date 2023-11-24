const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_N8bwtya9NU0jFB5ieNazsfbJ");
const Model = require("../models/index");
const Validation = require("../validations/validation");
const Message = require("../Message");
const Services = require("../services");
const HTTPError = require("../utils/CustomError");
const responseHelper = require("../helper/response.helper");
const FamilyHelper = require("../helper/family.helper");
const Status = require("../status");
const moment = require("moment");

const fs = require("fs");
const path = require("path");
const encrypt = require("bcrypt");
const FormData = require('form-data');
const catchAsync = require("../utils/catchAsync");
const getDistance = require("../utils/getDistance");

const pushRepository = require("./pushController");
const pushRepo = new pushRepository();

const { IDVClient } = require('yoti');
const SANDBOX_CLIENT_SDK_ID = 'bbb23e67-b04c-4075-97f2-105c4559d46c';



module.exports = {

    // Retrieve Family user by FamilyId
    getFamilyUser: catchAsync(async (req, res, next) => {
        console.log("findFamilyById is called");
        try {
            var FamilyId = req.params.id;
            console.log(FamilyId)

            var result = await FamilyHelper.findFamilyById(FamilyId);

            var message = "FamilyId found successfully";
            if (result == null) {
                message = "FamilyId does not exist.";
            }

            return responseHelper.success(res, result, message);
        } catch (error) {
            responseHelper.requestfailure(res, error);
        }
    }),

    // Create a new Family
    createFamily: catchAsync(async (req, res, next) => {
        console.log("createFamily is called");
        try {
            var FamilyData = req.body;
            // FamilyData.images = []
            // if (Array.isArray(req.files.images)) {
            //     for (let i = 0; i < req.files.images.length; i++) {
            //         FamilyData.images.push(`public/images/${req.files.images[i].originalname}`)

            //     }
            // }
            var result = await FamilyHelper.createFamily(FamilyData);

            var message = "Family created successfully";
            if (result == null) {
                message = "Family does not exist.";
            }

            return responseHelper.success(res, FamilyData, message);
        } catch (error) {
            responseHelper.requestfailure(res, error);
        }
    }),

    // Get a list of Familys
    getFamilyList: async (req, res) => {
        console.log("getFamilyList called");
        var FamilyData = req.body;

        try {
            var result = await FamilyHelper.getFamilyList(
                FamilyData.sortproperty,
                FamilyData.sortorder,
                FamilyData.offset,
                FamilyData.limit,
                FamilyData.query
            );

            var message = "Successfully loaded";

            responseHelper.success(res, result, message);
        } catch (err) {
            responseHelper.requestfailure(res, err);
        }
    },

    // Get all Family users with full details
    getAllFamilyUsers: catchAsync(async (req, res, next) => {
        console.log("Familydetails is called");
      try {
            // var FamilyData = req.body;

            // var result = await FamilyHelper.getFamilyWithFullDetails(FamilyData.sortproperty, FamilyData.sortorder, FamilyData.offset, FamilyData.limit, FamilyData.query);
            const pageNumber = parseInt(req.query.pageNumber) || 0;
            const limit = parseInt(req.query.limit) || 10;
            var message = "Familydetails found successfully";
            var Families = await Model.Family.find()
                .skip((pageNumber * limit) - limit)
                .limit(limit)
                .sort("-_id")
                ;

            const FamilySize = Families.length
            const result = {
                Family: Families,
                count: FamilySize,
                limit: limit
            }
            if (result == null) {
                message = "Familydetails does not exist.";
            }
            return responseHelper.success(res, result, message);
        } catch (error) {
            responseHelper.requestfailure(res, error);
        }
    }),


    // Update a Family user
    updateFamily: catchAsync(async (req, res, next) => {
        // Get the Family user data from the request body
        var FamilyUserData = req.body;
        try {
            // Update the Family user with the updated data
            var result = await Model.Family.findOneAndUpdate(
                { _id: FamilyUserData.FamilyId },
                FamilyUserData,
                {
                    new: true,
                }
            );
            var message = "Family  status updated successfully";
            res.ok(message, result);
        } catch (err) {
            throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
        }
    }),

    // Delete a Family user
    declineFamily: catchAsync(async (req, res, next) => {
        var FamilyId = req.params.id
        try {
            const FamilyUser = await Model.Family.findOneAndDelete(FamilyId)
            if (!FamilyUser)
                return res.badRequest("Family  Not Found in our records");
            var message = "Family user deleted successfully";
            res.ok(message, FamilyUser);
        } catch (err) {
            throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
        }
    }),
};


