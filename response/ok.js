module.exports = (req,res,next) => {
    res.ok = function (message, data) {
        res.status(200).send({success: true, message: message || 'SUCCESS', data: data});
    };
    next();
};
