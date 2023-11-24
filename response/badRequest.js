module.exports = (req, res, next) => {
  res.badRequest = function (message) {
    res.status(400).send({ success: false, message: message });
  };
  next();
};
