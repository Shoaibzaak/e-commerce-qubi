const referralCodes = require("referral-codes");
const issue = () => {
  return referralCodes.generate({
    length: 4,
    charset: "0123456789",
  })[0];
};

module.exports = {
  issue,
};
