const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
const { request, response } = require("express");
const httpStatus = require("http-status-codes");
const Joi = require('joi');

const mongoose = require("mongoose");
const { category } = require("../validators");
const Validator = require('../middlewares/Validator');

//Category listing
router.get("/", async (request, response) => {
  const categoryList = await Category.find().select(" -__v");
  if (!categoryList) {
    return response.send(httpStatus.StatusCodes.NOT_FOUND).json({
      success: false,
      message: "No records found.",
    });
  }
  return response.status(httpStatus.StatusCodes.OK).json({
    success: true,
    message: "Category listing.",
    data: categoryList,
  });
});

//Get category by id.
router.get("/:categoryId", async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.categoryId)) {
    return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid Category id.",
    });
  }
  const category = await Category.findById(request.params.categoryId).select(
    " -__v");

  if (!category) {
    return response
      .status(httpStatus.StatusCodes.NOT_FOUND)
      .json({ success: false, message: "No category found." });
  }

  return response
    .status(httpStatus.StatusCodes.OK)
    .json({ success: true, data: category });
});


function validateFunction(req) {

  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    icon: Joi.string().min(6).required(),
    //    color: Joi.string().allow("")
  });

  const options = {
    abortEarly: false, // include all errors
    //   allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
    errors: {
      wrap: {
        label: false
      }
    }
  };

  return schema.validate(req, options);
}

//post request
router.post("/", Validator('category'), async (request, response) => {
  //  const { body } = request;
  //  const { error } = validateFunction(body);

  // if (error) {
  //   let errorsArray = [];

  //   error.details.forEach(element => {
  //     console.log(element.message);
  //     errorsArray.push(element.message);
  //   });

  //   return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
  //     success: false,
  //     message: errorsArray,
  //   });

  // } else {
  let category = new Category({
    name: request.body.name,
    icon: request.body.icon,
    color: request.body.color,
  });

  category = await category.save();

  if (!category) {
    return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Category not created.",
    });
  }

  return response.status(httpStatus.StatusCodes.CREATED).json({
    success: true,
    message: "Category created successfully.",
    data: category,
  });
  //  }
});

// delete route
router.delete("/:categoryId", (request, response) => {
  if (!mongoose.isValidObjectId(request.params.categoryId)) {
    return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid Category id.",
    });
  }
  Category.findByIdAndRemove(request.params.categoryId)
    .then((category) => {
      if (category) {
        return response
          .status(httpStatus.StatusCodes.OK)
          .json({ success: true, message: "Category deleted." });
      } else {
        return response
          .status(httpStatus.StatusCodes.NOT_FOUND)
          .json({ success: false, message: "Category not found." });
      }
    })
    .catch((error) => {
      return response
        .status(httpStatus.StatusCodes.BAD_REQUEST)
        .json({ success: false, message: error });
    });
});

// update category
router.put("/:categoryId", async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.categoryId)) {
    return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid Category id.",
    });
  }
  const category = await Category.findByIdAndUpdate(
    request.params.categoryId,
    {
      name: request.body.name,
      icon: request.body.icon,
      color: request.body.color,
    },
    { new: true } //returns last updated record.
  );

  if (!category) {
    return response.status(400).json({
      success: false,
      message: "Category not updated.",
    });
  }
  return response.status(httpStatus.StatusCodes.OK).json({
    success: true,
    message: "Category updated successfully.",
    data: category,
  });
});


// return total number of category.
router.get('/get/count', async (request, response) => {
  const categoryCount = await Category.countDocuments();

  if (!categoryCount) {
    return response
      .status(500)
      .json({ success: false, message: "Internal Error." });
  }
  return response.status(httpStatus.StatusCodes.OK).json({
    success: true,
    message: "Total Category count.",
    count: categoryCount,
  });
});


module.exports = router;
