
const _ = require('lodash');

let generateSKU = () => {
// You can customize this function further based on your requirements
return Math.random().toString(36).substr(2, 9).toUpperCase(); // Generates a random string

};





module.exports = {
    generateSKU:generateSKU
};
