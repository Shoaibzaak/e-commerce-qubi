var jwt = require('jsonwebtoken');
var SECRETKEY = require('../config/config').TOKENSECRET;
var issue  = payload => {
    return jwt.sign(
        payload,
        SECRETKEY,
        // {expiresIn: 60 * 60 * 24 * 7}
    );
};
var forgetToken  = payload => {
    return jwt.sign(
        payload,
        SECRETKEY,
        {expiresIn: Date.now() + 3600000} //token valid for the 1 hour
    );
};
var verify = (token, cb) => {
    return jwt.verify(token, SECRETKEY, {}, cb);
};
module.exports = {
    issue: issue,
    verify: verify,
    forgetToken:forgetToken
};
