module.exports = (req,res,next) => {
    res.forbidden = function (message) {
        res.status(403).send({success: false, message: message});
    };
    next();
};
