module.exports = (req, res, next) => {
  res.notFound = function (message) {
    res.status(404).send({ success: false, message: message });
  };
  next();
};
