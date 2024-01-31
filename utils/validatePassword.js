const Model = require("../models/index");

const validatePassword = async (payload) => {
  const { password, userId } = payload;

  // Validate password format using regex
  const match = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);

  if (!match) {
    // If password format does not match, return false
    return false;
  }

  if (userId) {
    // If userId is provided, check for existing passwords for the specific user
    const existingPasswords = await Model.User.find({ password, userId });
    
    // Using Array.prototype.some for better efficiency
    const isExisting = existingPasswords.some(async (existingPassword) => {
      // Compare the provided password with each existing password for the user
      const isMatch = await existingPassword.comparePassword(password);
      return isMatch; // Return true if any existing password matches the provided password
    });

    // Return true only if no existing password matches the provided password
    return !isExisting;
  } else {
    // If userId is not provided, always return true
    return true;
  }
};

module.exports = validatePassword;
