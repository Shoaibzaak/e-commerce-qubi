const Model = require("../../models/index");
const Validation = require("../../utils/validations/validation");
const Message = require("../../Message");
const Services = require("../../services");
const otpService = require("../../services/OtpService");
const Status = require("../../status");
const HTTPError = require("../../utils/CustomError");
const moment = require("moment");
const catchAsync = require("../../utils/catchAsync");
const referralCodes = require("referral-codes");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const validatePassword = require("../../utils/validatePassword");
const cloudUpload = require("../../cloudinary");
module.exports = {
  accountVerificationAdmin: catchAsync(async (req, res, next) => {
    const { otp } = req.body;
    if (!otp) throw new HTTPError(Status.BAD_REQUEST, Message.required);

    const now = moment().valueOf();
    let user;
    if (otp) {
      user = await Model.Admin.findOne({ otp: otp });
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
      await Model.Admin.findOneAndUpdate(
        { otp: otp },
        { $set: { isEmailConfirmed: true }, $unset: { otp: 1, otpExpiry: 1 } }
      );
    }

    userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      ...userData,
    };
    return res.ok("Account verified successfully", userData);
  }),
  //resend otp to email
  resendAdminOtp: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) throw new HTTPError(Status.BAD_REQUEST, Message.required);
    if (!Validation.validateEmail(email)) {
      return res.badRequest("Invalid email format");
    }
    const otp = otpService.issue();
    const otpExpiryCode = moment().add(10, "minutes").valueOf();
    if (email) {
      await Model.Admin.findOneAndUpdate(
        { email: email },
        { $set: { otp: otp, otpExpiry: otpExpiryCode } }
      );
    }
    // const token =  Services.JwtService.issue({
    //   id: Services.HashService.encrypt(user._id),
    // })
    // console.log(token)
     // Construct the email message with the OTP
     const emailMessage = `Thank you for registering with WE DON'T KNOW WHAT WE HAVE.\n\nYour verification code is: ${otp}`;
    await Services.EmailService.sendEmail(
      emailMessage,
      otp,
      email,
      "Reset otp "
    );
    return res.ok("Reset otp has been sent to your registered email.");
  }),

  forgetAdminPassword: catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      return res.badRequest(Message.badRequest);
    }

    try {
      let user = await Model.Admin.findOne({ email });

      if (!user) {
        throw new HTTPError(Status.BAD_REQUEST, Message.userNotFound);
      }
      // Generate a unique token for password reset
      const resetToken = crypto.randomBytes(20).toString("hex");

      // Set the reset token and its expiry in the user document
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 600000; // Token expires in 10 minutes

      // Save the user document with the reset token
      await user.save();

      // Send email with the reset link
      const resetLink = `http://localhost:3000/forgetPassword?token=${resetToken}`;

      // Send email with temporary password
      const replacements = {
        resetLink,
      };

      await Services.EmailService.sendEmail(
        resetLink,
        "otp",
        email,
        "Change Password Link"
    );
    
      return res.ok("Reset Link has been sent to your registered email.");
    } catch (error) {
      // Handle errors
      if (error instanceof HTTPError) {
        return res.status(error.status).send(error.message);
      }
      console.error(error); // Log other unexpected errors for debugging
      return res.status(Status.INTERNAL_SERVER_ERROR).send(Message.serverError);
    }
  }),
  updateAdminPassword: catchAsync(async (req, res, next) => {
    const { newPassword } = req.body;
    const { token } = req.query;
    if (!newPassword)
      return res.status(400).json({
        success: false,
        message: Message.badRequest,
        data: null,
      });
    let user;
    user = await Model.Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the token is not expired
    });
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
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    await Model.Admin.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          password: hash,
        },
        $unset: {
          // resetPasswordToken: 1,
          otp: 1,
          otpExpiry: 1,
          // resetPasswordExpires: 1,
        },
      }
    );

    return res.ok("Password has been successfully reset.");
  }),

  changeAdminPassword: catchAsync(async (req, res, next) => {
    try {
      // Get authenticated user
      const verifiedUser = req.user;
      const { currentPassword, newPassword } = req.body;
  
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: Message.required,
          data: null,
        });
      }
  
      // Find admin user
      let user = await Model.Admin.findOne({ _id: verifiedUser._id });
  
      // Handle user not found
      if (!user) {
        throw new HTTPError(Status.NOT_FOUND, Message.userNotFound);
      }
  
      // Check if the new password meets criteria
      if (!validatePassword({ password: newPassword })) {
        return res.status(400).json({
          success: false,
          message: Message.passwordTooWeak,
          data: null,
        });
      }
  
      // Compare current password with hashed password
      bcrypt.compare(currentPassword, user.password, async (err, match) => {
        if (match) {
          // Generate salt and hash new password
          bcrypt.genSalt(10, async (error, salt) => {
            if (error) throw error;
  
            bcrypt.hash(newPassword, salt, async (error, hash) => {
              if (error) throw error;
  
              // Update user password in the database
              await Model.Admin.findOneAndUpdate(
                { _id: user._id },
                { $set: { password: hash } }
              );
  
              // Respond with success message and updated user
              user = { ...user._doc };
              return res.ok("Password updated successfully", user);
            });
          });
        } else {
          // Incorrect credentials
          return res.badRequest("Invalid Credentials");
        }
      });
    } catch (error) {
      // Handle any unexpected errors
      next(error);
    }
  }),
  registerAdmin: async (req, res, next) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      // Email validation
      if (!Validation.validateEmail(email)) {
        return res.badRequest("Invalid email format");
      }
      let role = "vendor"; // Set a default role if the condition is not met

      const isValidate = await validatePassword({ password });
      if (!isValidate) return res.badRequest(Message.passwordTooWeak);
      const hash = bcrypt.hashSync(password, 10);
      const otp = otpService.issue();
      const otpExpiry = moment().add(10, "minutes").valueOf();
      const verifyEmail = await Model.Admin.findOne({ email });
      if (verifyEmail)
        throw new HTTPError(Status.BAD_REQUEST, Message.emailAlreadyExists);
      const User = new Model.Admin({
        firstName,
        lastName,
        email,
        role,
        otp: otp,
        otpExpiry: otpExpiry,
        password: hash,
      });

      // Delete unverified users who has register 24 hours before
      //  await Model.Admin.deleteMany({
      //   isEmailConfirmed: false,
      //   createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      // });
      await User.save();
      // Construct the email message with the OTP
      const emailMessage = `Thank you for registering with MATT.\n\nYour verification code is: ${otp}`;

      // Send the email with the message directly
      await Services.EmailService.sendEmail(
        emailMessage,
        otp,
        email,
        "User Account Email Verification "
      );
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
          role: Services.HashService.encrypt(user.role)
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
    } catch (error) {
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
