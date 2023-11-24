const Hash = require('cryptr');
const hash = new Hash('mySecretKeyFor___-%!%');
var encryption = text => {
    return hash.encrypt(text);
};

var decryption = text => {
    return hash.decrypt(text);
};
module.exports = {
    encrypt: encryption,
    decrypt: decryption
};
