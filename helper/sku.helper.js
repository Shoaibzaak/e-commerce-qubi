
const _ = require('lodash');
const Modle=require('../models/index')
let generateUniqueSKU = async () => {
    try {
        while (true) {
            const potentialSKU = 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            
            // Check if the potential SKU already exists in the database
            const existingProduct = await Modle.Product.findOne({ $or: [{ sku: potentialSKU }, { 'variations.sku': potentialSKU }] });
            if (!existingProduct) {
                return potentialSKU;  // This SKU is unique, so we can return it
            }
            
            // If the SKU already exists, the loop will continue to generate another potential SKU
        }
    } catch (error) {
        console.error("Error generating SKU:", error);
        throw new Error("Failed to generate unique SKU.");
    }

};





module.exports = {
    generateUniqueSKU:generateUniqueSKU
};
