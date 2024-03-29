const mongoose = require("mongoose");
const Model = require("../../models/index");
const HTTPError = require("../../utils/CustomError");
const responseHelper = require("../../helper/response.helper");
const CategoryHelper = require("../../helper/category.helper");
const Status = require("../../status");
const catchAsync = require("../../utils/catchAsync");

module.exports = {
  // Retrieve Category user by CategoryId
  getCategoryUser: catchAsync(async (req, res, next) => {
    console.log("findCategoryById is called");
    try {
      var CategoryId = req.params.id;
      console.log(CategoryId);

      var result = await CategoryHelper.findCategoryById(CategoryId);

      var message = "CategoryId found successfully";
      if (result == null) {
        message = "CategoryId does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  // Create a new Category
  createCategory: catchAsync(async (req, res, next) => {
    console.log("createCategory is called");
    try {
      const { categoryName, parentId } = req.body;
  
      let parentCategory = null;
  
      if (parentId) {
        parentCategory = await Model.Category.findById(parentId);
  
        if (!parentCategory) {
          return res.status(404).json({ message: "Parent category not found" });
        }
      }
  
      const newCategory = new Model.Category({
        categoryName,
        parentCategory: parentId || null,
      });
  
      const savedCategory = await newCategory.save();
  
      // If parentCategory exists, update its childCategories array
      if (parentCategory) {
        parentCategory.childCategories.push(savedCategory._id);
        await parentCategory.save();
      }
  
      res.json(savedCategory);
    } catch (error) {
      console.error(error);
      res.status(500).send(error?.message, "Server Error");
    }
  }),
  

  // Get a list of Categorys
  getCategoryList: async (req, res) => {
    console.log("getCategoryList called");
    var CategoryData = req.body;

    try {
      var result = await CategoryHelper.getCategoryList(
        CategoryData.sortproperty,
        CategoryData.sortorder,
        CategoryData.offset,
        CategoryData.limit,
        CategoryData.query
      );

      var message = "Successfully loaded";

      responseHelper.success(res, result, message);
    } catch (err) {
      responseHelper.requestfailure(res, err);
    }
  },

  // Get all Category users with full details
  getAllCategoryUsers: catchAsync(async (req, res, next) => {
    console.log("Categorydetails is called");
    try {
      // Fetch all categories without pagination and populate parentCategory
      if(req.query){
        
        let parentCategory = req.query.parentCategory
        let subcategories = await Model.Category.find({ isDeleted: false ,parentCategory:parentCategory }).select("_id categoryName parentCategory")
        .populate({
          path: "parentCategory",
          select: "_id categoryName",
        })
        .sort("-_id")
        const CategorySize = subcategories.length;

      const result = {
        Category: subcategories,
        count: CategorySize,
      };

      // Check if no categories are found
    
      if (CategorySize === 0) {
        // Return an empty array as the result
        return responseHelper.success(
          res,
          [],
          "No subcategories found"
        );
      }
      // Return a success response with the result
      return responseHelper.success(
        res,
        result,
        "subCategorydetails found successfully"
      );
      }

      const parentCategories = await Model.Category.find({ isDeleted: false,parentCategory:null })
        .sort("-_id")
        .select("_id categoryName ")
      const CategorySize = parentCategories.length;

      const result = {
        Category: parentCategories,
        count: CategorySize,
      };

      // Check if no categories are found
    

      // Return a success response with the result
      return responseHelper.success(
        res,
        result,
        "Categorydetails found successfully"
      );
    } catch (error) {
      // Handle errors and return a failure response
      responseHelper.requestfailure(res, error);
    }
  }),

  updateCategory: catchAsync(async (req, res, next) => {
    try {
      // // Validate the incoming data
      // validateCategoryData(req.body);

      // Get the Category user data from the request body
      const categoryUserData = req.body;

      // Find the category by ID
      const existingCategory = await Model.Category.findById(
        categoryUserData.CategoryId
      );

      // Check if the category exists
      if (!existingCategory) {
        throw new HTTPError(Status.NOT_FOUND, "Category not found");
      }

      // Update the Category user with the updated data
      const result = await Model.Category.findByIdAndUpdate(
        categoryUserData.CategoryId,
        categoryUserData,
        {
          new: true,
        }
      );

      const message = "Category status updated successfully";
      res.ok(message, result);
    } catch (err) {
      next(err); // Pass the error to the error-handling middleware
    }
  }),

  // Delete a Category user
  declineCategory: catchAsync(async (req, res, next) => {
    var CategoryId = req.params.id;
    try {
      const { childParams } = req.query;

      if (childParams) {
        const deletedCategory = await Model.Category.findById(CategoryId);
           
        await deletedCategory.customUpdate({ isDeleted: true });
        // If category is not found, return a bad request response
        if (!deletedCategory)
          return res.badRequest("subCategory not found in our records");

        var message = "SubCategory marked as deleted successfully";
        res.ok(message, deletedCategory);
      } else {
        // If childParams doesn't exist, update the category to set isDeleted to true
        const updatedCategory = await Model.Category.findById(CategoryId);
        if (!updatedCategory)
          return res.badRequest("Category not found in our records");

        try {
          await updatedCategory.customUpdate({ isDeleted: true });
          var message = "Category marked as deleted successfully";
          res.ok(message, updatedCategory);
        } catch (err) {
          if (err.childCategories) {
            // Handle the specific error from the middleware
            return res.status(400).json({
              error: "Cannot update category with child categories.",
              childCategories: err.childCategories,
            });
          } else {
            // Handle other errors
            // Handle other errors
    throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
          }
        }
      }
    } catch (err) {
      console.log(err.message);
      if (err.childCategories) {
        // Handle the specific error from the middleware
        return res.status(400).json({
          error: "Cannot update category with child categories.",
          childCategories: err.childCategories,
        });
      } else {
       // Handle other errors
    throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
      }
    }
  }),

  getAllCategoryBrand: catchAsync(async (req, res, next) => {
    console.log("CategoryBranddetails is called");
    try {
      const categories = await Model.Category.find().sort("-_id");
      const brands = await Model.Brand.find().sort("-_id");

      const CategorySize = categories.length;
      const BrandSize = brands.length;

      const result = {
        Category: categories,
        Brand: brands,
        totalCategory: CategorySize,
        totalBrand: BrandSize,
      };

      if (CategorySize === 0 || BrandSize === 0) {
        // If no products are found, return a not found response
        return responseHelper.notFound(
          res,
          "Category and Brand details do not exist."
        );
      }

      const message = "CategoryBranddetails found successfully";
      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  getAllCategoryParentWise: catchAsync(async (req, res, next) => {
    console.log("Categorydetails is called");
    try {
      // Find parent categories with non-empty childCategories array
      const parentCategories = await Model.Category.find({ isDeleted: false, parentCategory: null, childCategories: { $exists: true, $not: { $size: 0 } } })
        .sort("-_id")
        .populate({
          path: "childCategories",
          select: "_id categoryName",
        });
      
      // Find categories where parentCategory is null and childCategories is empty
      const nullParentCategories = await Model.Category.find({ isDeleted: false, parentCategory: null, childCategories: { $exists: true, $size: 0 } })
        .select("_id categoryName");
      
      // Merge the nullParentCategories with parentCategories
      const mergedCategories = [...parentCategories, ...nullParentCategories];
  
      const CategorySize = mergedCategories.length;
  
      const result = {
        Category: mergedCategories,
        count: CategorySize,
      };
  
      // Return a success response with the result
      return responseHelper.success(
        res,
        result,
        "Category details found successfully"
      );
    } catch (error) {
      // Handle errors and return a failure response
      responseHelper.requestfailure(res, error);
    }
  })

  
};
