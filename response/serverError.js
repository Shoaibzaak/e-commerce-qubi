module.exports = (req, res, next) => {
  res.serverError = function (message) {
    res.status(500).send({ success: false, message: message });
  };
  next();
};
