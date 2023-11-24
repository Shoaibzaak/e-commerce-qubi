const Model = require("../models/index");

const validatePassword = async (payload) => {
  const { password, userId, businessId } = payload;
  const match =
  /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(
      password
    );

  if (!match) return false;

  if (userId) {
    const existingPasswords = await Model.Password.find({ userId });
    existingPasswords.forEach(async (existingPassword) => {
      const isMatch = await existingPassword.comparePassword(password);
      if (isMatch) return false;
    });
    return true;
  } else if (businessId) {
    const existingPasswords = await Model.Password.find({ businessId });
    existingPasswords.forEach(async (existingPassword) => {
      const isMatch = await existingPassword.comparePassword(password);
      if (isMatch) return false;
    });
    return true;
  } else {
    return true;
  }
};

module.exports = validatePassword;
