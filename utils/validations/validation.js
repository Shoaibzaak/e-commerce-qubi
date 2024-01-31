const Model = require("../../models/index");
const HTTPError = require("../CustomError");
const Status = require("../../status");
const Message = require("../../Message");

module.exports = {

  validateEmail : (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },


  validateUser: async (id) => {
    const user = await Model.User.findOne({ _id: id, isActive: true }).populate(
      "sectors.sector"
    );
    if (!user) throw new HTTPError(Status.BAD_REQUEST, Message.userNotFound);
    return user;
  },

 

  validateAccountNumber: async (accountNumber) => {
    const accountNumberPattern = /^\d{8}$/;
    return accountNumberPattern.test(accountNumber);
  },


  validatePaymentDetail: async (id, userId) => {
    const paymentDetail = await Model.PaymentDetail.findOne({ _id: id, userId });
    if (!paymentDetail)
      throw new HTTPError(Status.BAD_REQUEST, Message.DetailNotFound);
    return paymentDetail;
  },

};
