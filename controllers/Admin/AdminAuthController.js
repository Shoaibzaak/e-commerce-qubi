const Model = require("../../models/index");
const Validation = require("../../validations/validation");
const Message = require("../../Message");
const Services = require("../../services");
const otpService = require("../../services/OtpService");
const Status = require("../../status");
const HTTPError = require("../../utils/CustomError");
const moment = require("moment");
const catchAsync = require("../../utils/catchAsync");
const referralCodes = require("referral-codes");
const bcrypt = require("bcrypt");
const validatePassword = require("../../utils/validatePassword");
const cloudUpload = require("../../cloudinary");
module.exports = {
  accountVerification: catchAsync(async (req, res, next) => {
    const { otp } = req.body;
    if (!otp) throw new HTTPError(Status.BAD_REQUEST, Message.required);

    const now = moment().valueOf();
    let user;
    if (otp) {
      user = await Model.User.findOne({ otp: otp });
    } else {
      throw new HTTPError(Status.BAD_REQUEST, "otp is required");
    }

    if (!user) throw new HTTPError(Status.BAD_REQUEST, Message.userNotFound);
    else if (user.otpExpiry < now)
      throw new HTTPError(Status.BAD_REQUEST, "OTP expired");
    else if (user.isEmailConfirmed)
      throw new HTTPError(Status.BAD_REQUEST, "Account already verified");
    else if (parseInt(user.otp) !== parseInt(otp))
      throw new HTTPError(Status.BAD_REQUEST, "Invalid OTP");

    let userData = {};
    if (otp) {
      await Model.User.findOneAndUpdate(
        { otp: otp },
        { $set: { isEmailConfirmed: true }, $unset: { otp: 1, otpExpiry: 1 } }
      );
    }

    userData = {
      _id: user._id,
      fullname: user.fullName,
      email: user.email,
      ...userData,
    };
    return res.ok("Account verified successfully", userData);
  }),
  //resend otp to email
  resendOtp: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) throw new HTTPError(Status.BAD_REQUEST, Message.required);
    if (!Validation.validateEmail(email)) {
      return res.badRequest("Invalid email format");
    }
    const otp = otpService.issue();
    const otpExpiryCode = moment().add(10, "minutes").valueOf();
    if (email) {
      await Model.User.findOneAndUpdate(
        { email: email },
        { $set: { otp: otp, otpExpiry: otpExpiryCode } }
      );
    }
    let otpCode = {
      otp,
    };
    // const token =  Services.JwtService.issue({
    //   id: Services.HashService.encrypt(user._id),
    // })
    // console.log(token)
    await Services.EmailService.sendEmail(
      "public/otpVerification.html",
      otpCode,
      email,
      "Reset Password | In VAGABOND"
    );
    return res.ok("Reset password otp has been sent to your registered email.");
  }),

  forgetPassword: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.badRequest(Message.badRequest);
    let user;
    user = await Model.User.findOne({ email });

    if (!user) throw new HTTPError(Status.BAD_REQUEST, Message.userNotFound);
    // if (user.isEmailConfirmed == false) throw new HTTPError(Status.BAD_REQUEST, "Your account is not verfied");
    const otp = otpService.issue();
    const otpExpiryCode = moment().add(10, "minutes").valueOf();
    const tempPassword = referralCodes.generate({
      length: 8,
      charset: referralCodes.charset("alphanumeric"),
    })[0];
    // console.log(tempPassword,"tempPassword===>")
    encrypt.genSalt(10, (error, salt) => {
      if (error) return console.log(error);
      encrypt.hash(tempPassword, salt, async (error, hash) => {
        // if (user) {
        await Model.User.findOneAndUpdate(
          { _id: user._id },
          { $set: { password: hash } }
        );
        //   // const token = `GHA ${Services.JwtService.issue({
        //   //   id: Services.HashService.encrypt(user._id),
        //   // })}`;
        //   // user = { ...user._doc, usertype: "User" };
        //   // return res.ok("Password updated successfully and", user);
        // }
      });
    });

    // if (user) {
    //   await Model.User.findOneAndUpdate({ _id: user._id }, { $set: { otp: otp, otpExpiry: otpExpiryCode } });
    // }
    let replacements = {
      // otp,
      tempPassword,
    };
    // const token =  Services.JwtService.issue({
    //   id: Services.HashService.encrypt(user._id),
    // })
    // console.log(token)
    await Services.EmailService.sendEmail(
      "public/otpResetPass.html",
      replacements,
      email,
      "Forget Password | In VAGABOND"
    );
    return res.ok(
      "Temporary password  has been sent to your registered email."
    );
  }),
  updatePassword: catchAsync(async (req, res, next) => {
    const { otp, newPassword } = req.body;
    if (!otp || !newPassword)
      return res.status(400).json({
        success: false,
        message: Message.badRequest,
        data: null,
      });
    let user;
    user = await Model.User.findOne({ otp });
    //User not found
    if (!user) throw new HTTPError(Status.NOT_FOUND, Message.userNotFound);
    if (user) {
    }
    if (
      !validatePassword({
        password: newPassword,
      })
    )
      return res.status(400).json({
        success: false,
        message: Message.passwordTooWeak,
        data: null,
      });
    encrypt.genSalt(10, (error, salt) => {
      if (error) return console.log(error);
      encrypt.hash(newPassword, salt, async (error, hash) => {
        if (user) {
          await Model.User.findOneAndUpdate(
            { _id: user._id },
            { $set: { password: hash }, $unset: { otp: 1, otpExpiry: 1 } }
          );
          // const token = `GHA ${Services.JwtService.issue({
          //   id: Services.HashService.encrypt(user._id),
          // })}`;
          user = { ...user._doc, usertype: "User" };
          return res.ok("Password updated successfully", user);
        }
      });
    });
  }),

  changePassword: catchAsync(async (req, res, next) => {
    // this user get from authenticated user
    const verifiedUser = req.user;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({
        success: false,
        message: Message.badRequest,
        data: null,
      });
    let user;
    user = await Model.User.findOne({ _id: verifiedUser._id });
    //User not found
    if (!user) throw new HTTPError(Status.NOT_FOUND, Message.userNotFound);
    if (user) {
    }
    if (
      !validatePassword({
        password: newPassword,
      })
    )
      return res.status(400).json({
        success: false,
        message: Message.passwordTooWeak,
        data: null,
      });

    encrypt.compare(currentPassword, user.password, (err, match) => {
      if (match) {
        encrypt.genSalt(10, (error, salt) => {
          if (error) return console.log(error);
          encrypt.hash(newPassword, salt, async (error, hash) => {
            if (user) {
              await Model.User.findOneAndUpdate(
                { _id: user._id },
                { $set: { password: hash } }
              );
              // const token = `GHA ${Services.JwtService.issue({
              //   id: Services.HashService.encrypt(user._id),
              // })}`;
              user = { ...user._doc, usertype: "User" };
              return res.ok("Password updated successfully", user);
            }
          });
        });
      } else {
        return res.badRequest("Invalid Credentials");
      }
    });
  }),
  registerAdmin: async (req, res, next) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      // Email validation
      if (!Validation.validateEmail(email)) {
        return res.badRequest("Invalid email format");
      }

      const isValidate = await validatePassword({ password });
      if (!isValidate) return res.badRequest(Message.passwordTooWeak);
      const hash = bcrypt.hashSync(password, 10);
      // const otp = otpService.issue();
      // const otpExpiry = moment().add(10, "minutes").valueOf();
      const verifyEmail = await Model.Admin.findOne({ email });
      if (verifyEmail)
        throw new HTTPError(Status.BAD_REQUEST, Message.emailAlreadyExists);
      const User = new Model.Admin({
        firstName,
        lastName,
        email,
        password: hash,
      });

      // Delete unverified users who has register 24 hours before
      // await Model.Admin.deleteMany({isEmailConfirmed: false, createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
      await User.save();
      // let otpCode = {
      //   otp,
      // };
      // await Services.EmailService.sendEmail(
      //   "public/otpVerification.html",
      //   otpCode,
      //   email,
      //   "User Account Email Verification | vagabond"
      // );
      return res.ok("Admin Registred successfully.", User);
    } catch (err) {
      next(err);
    }
  },

  //   try {
  //     const { email, password } = req.body;
  //     if (!email || !password)
  //       throw new HTTPError(Status.BAD_REQUEST, Message.required);
  //     // Email validation
  //     if (!Validation.validateEmail(email)) {
  //       return res.badRequest("Invalid email format");
  //     }
  //     let user;
  //     user = await Model.Admin.findOne({ email });
  //     if (!user) throw new HTTPError(Status.NOT_FOUND, Message.userNotFound);
  //     // if (user.isEmailConfirmed == true) {
  //       encrypt.compare(password, user.password, async (err, match) => {
  //         if (match) {
  //           await Model.Admin.findOneAndUpdate(
  //             { _id: user._id },
  //           );
  //           const token = `${Services.JwtService.issue({
  //             id: Services.HashService.encrypt(user._id),
  //           })}`;
  //           return res.ok("Log in successfully", {
  //             token,
  //             user,
  //           });
  //         } else {
  //           return res.badRequest("Invalid Credentials");
  //         }
  //       });
  //     // }
  //     // else {
  //     //   return res.badRequest("User Not Verified");
  //     // }
  //   } catch (err) {
  //     console.log(err);
  //     next(err);
  //   }
  // },
  loginAdmin: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new HTTPError(Status.BAD_REQUEST, Message.required);
      }

      if (!Validation.validateEmail(email)) {
        return res.badRequest("Invalid email format");
      }

      let user = await Model.Admin.findOne({ email });

      if (!user) {
        throw new HTTPError(Status.NOT_FOUND, Message.userNotFound);
      }
      const newFieldValue = "new value";
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        await Model.Admin.findOneAndUpdate(
          { _id: user._id },
          { $set: { fieldName: newFieldValue } }
        );
        // const token = Services.JwtService.issue({
        //   id: Services.HashService.encrypt(user._id),
        // });
        const token = `GHA ${Services.JwtService.issue({
          id: Services.HashService.encrypt(user._id),
        })}`;

        return res.ok("Log in successfully", {
          token,
          user,
        });
      } else {
        return res.badRequest("Invalid Credentials");
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
  getAdminById: async (req, res, next) => {
    try {
      const admin = req.user; // Assuming the admin ID is passed as a route parameter
      const adminId = admin._id;
      if (!adminId) {
        throw new HTTPError(Status.BAD_REQUEST, "Admin ID is required");
      }

      let user = await Model.Admin.findById(adminId).populate("address");

      if (!user) {
        throw new HTTPError(Status.NOT_FOUND, "Admin not found");
      }

      // Return admin details excluding the password
      const adminDetails = {
        _id: user._id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        profilePic: user?.profilePic,
        role: user?.role,
        address: user?.address,
        phoneNumber: user?.phoneNumber,
        bio: user?.bio,

        // Add other fields as needed
      };

      return res.ok("Admin details retrieved successfully", {
        admin: adminDetails,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
  uploadAdminProfilePic: catchAsync(async (req, res, next) => {
    const userData = req.body;
    const { address } = req.body;
    try {
      if (req.files.profilePic) {
        const file = req.files.profilePic[0]; // Assuming you only want to handle one profile picture
        const { path } = file;

        // Upload the file to Cloudinary
        var cloudinaryResult = await cloudUpload.cloudinaryUpload(path);
      }
      // Fetch the user
      const user = await Model.Admin.findById(userData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Handle address update
      if (address) {
        const addressData = JSON.parse(address);
        let savedAddress;

        // Check if user already has an address
        if (user.address) {
          savedAddress = await Model.Address.findByIdAndUpdate(
            user.address,
            addressData,
            { new: true }
          );
        } else {
          savedAddress = await new Model.Address(addressData).save();
        }

        user.address = savedAddress._id;
      }
      const result = await Model.Admin.findByIdAndUpdate(
        { _id: userData.userId },
        {
          profilePic: cloudinaryResult,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          bio: userData.bio,
          address: user.address,
        },
        { new: true, runValidators: true }
      );
      if (!result) {
        console.log("User not found");
        throw new HTTPError(Status.NOT_FOUND, "User not found");
      }

      const message = "Admin Data updated successfully";
      console.log(message);
      res.ok(message, result);
    }catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }),
  getAllCustomersAdmin: catchAsync(async (req, res, next) => {
    console.log("Fetching customers is called");
    try {
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;

      if (isNaN(pageNumber) || isNaN(limit) || pageNumber < 0 || limit < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
        });
      }

      const message = "Customers found successfully";

      const skipValue = pageNumber * limit - limit;
      if (skipValue < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid combination of pageNumber and limit.",
        });
      }

      // Aggregation pipeline to get only customers where isDeleted is false
      const Customers = await Model.User.aggregate([
        { $match: { isDeleted: false } },
        { $skip: skipValue },
        { $sort: { createdAt: -1 } },
        { $limit: limit },
        // Add any additional stages or lookups you need here
      ]);

      const CustomerSize = await Model.User.countDocuments({
        isDeleted: false,
      });

      const result = {
        Customers: Customers,
        totalCustomers: CustomerSize,
        limit: limit,
      };

      if (CustomerSize === 0) {
        return res.status(404).json({
          success: false,
          message: "Customers do not exist.",
        });
      }

      return res.status(200).json({
        success: true,
        data: result,
        message: message,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }),

  // Update a User with a particular ID
  updateUser: catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const updateData = req.body; // Assuming the request body contains the updated data

    try {
      const updatedUser = await Model.User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.badRequest("User Not Found in our records");
      }

      const message = "User updated successfully";
      res.ok(message, updatedUser);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
  // Retrieve a single User with a particular ID
  getSingleUser: catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    try {
      const user = await Model.User.findById(userId)
        .select("-password") // Exclude the password field
        .populate("address");

      if (!user) {
        return res.badRequest("User Not Found in our records");
      }

      res.ok("User retrieved successfully", user);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
  // Delete a single User with a particular ID
  // Delete or Temporarily Mark a User based on a condition
  deleteUser: catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const { permanent } = req.query; // Assuming the query parameter "permanent" is used to determine the delete type

    try {
      let user;

      if (permanent === "true") {
        // Delete permanently based on the condition
        user = await Model.User.findByIdAndDelete(userId);
      } else {
        // Mark as temporarily deleted (update a field, e.g., isDeleted)
        user = await Model.User.findByIdAndUpdate(
          userId,
          { isDeleted: true },
          { new: true, runValidators: true }
        );
      }

      if (!user) {
        return res.badRequest("User Not Found in our records");
      }

      res.ok(
        permanent === "true"
          ? "User deleted permanently"
          : "User marked as temporarily deleted",
        user
      );
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
};
