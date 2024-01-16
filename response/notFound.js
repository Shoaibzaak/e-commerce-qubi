module.exports = (req, res, next) => {
  res.notFound = function (message,data) {
    res.status(404).send({ success: false, message: message ,brandData: data});
  };
  next();
};
