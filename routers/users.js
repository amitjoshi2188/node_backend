const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const httpStatus = require("http-status-codes");
const bcrypt = require("bcryptjs"); // to encrypt string.
const { Router, response } = require("express");
const jwt = require("jsonwebtoken");

// Users listing.
router.get("/", async (request, response) => {
  const userList = await User.find(); //.select("-__v -passwordHash");
  if (!userList) {
    return response.status(500).json({
      success: false,
      message: "No data found.",
    });
  }
  return response.status(httpStatus.StatusCodes.OK).json({
    success: true,
    data: userList,
  });
});

//get user by id
router.get("/:userId", async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.userId)) {
    return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid User id.",
    });
  }
  const user = await User.findById(request.params.userId).select(
    "-passwordHash, -__v"
  );
  if (!user) {
    return response.status(httpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
    });
  }
  return response.status(httpStatus.OK).json({
    success: true,
    data: user,
  });
});

//Add User
router.post("/", async (request, response) => {
  let user = new User({
    name: request.body.name,
    email: request.body.email,
    passwordHash: bcrypt.hashSync(request.body.password, 10),
    phone: request.body.phone,
    isAdmin: request.body.isAdmin,
    street: request.body.street,
    apartment: request.body.apartment,
    zip: request.body.zip,
    city: request.body.city,
    country: request.body.country,
  });

  user = await user.save();
  if (!user) {
    return response.status(404).json({
      success: false,
      message: "user not created.",
    });
  }

  return response.status(201).json({
    success: true,
    message: "user created successfully.",
    data: user,
  });
});

//update users
router.put("/:userId", async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.userId)) {
    return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid User id.",
    });
  }

  const user = await User.findByIdAndUpdate(
    request.params.userId,
    {
      name: request.body.name,
      email: request.body.email,
      passwordHash: bcrypt.hashSync(request.body.password, 10),
      phone: request.body.phone,
      isAdmin: request.body.isAdmin,
      street: request.body.street,
      apartment: request.body.apartment,
      zip: request.body.zip,
      city: request.body.city,
      country: request.body.country,
    },
    { new: true } //returns last updated record.
  );

  if (!user) {
    return response.status(400).json({
      success: false,
      message: "User not updated.",
    });
  }
  return response.status(httpStatus.StatusCodes.OK).json({
    success: true,
    message: "User updated successfully.",
    data: user,
  });
});

//Login

router.post("/login", async (request, response) => {
  const user = await User.findOne({ email: request.body.email }).select("-__v");
  const secret = process.env.secret; //getting from env file.
  if (!user) {
    return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "User not found.",
    });
  }
  if (user && bcrypt.compareSync(request.body.password, user.passwordHash)) {
    const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, secret, {
      expiresIn: "1d",
    });
    return response.status(httpStatus.StatusCodes.OK).json({
      success: true,
      message: "User matched.",
      data: user,
      token: token,
    });
  } else {
    return response
      .status(httpStatus.StatusCodes.NOT_FOUND)
      .json({ success: false, message: "Invalid login details." });
  }
});

//Register User API
router.post("/register", async (request, response) => {
  let user = new User({
    name: request.body.name,
    email: request.body.email,
    passwordHash: bcrypt.hashSync(request.body.password, 10),
    phone: request.body.phone,
    street: request.body.street,
    apartment: request.body.apartment,
    zip: request.body.zip,
    city: request.body.city,
    country: request.body.country,
  });

  user = await user.save();
  if (!user) {
    return response.status(404).json({
      success: false,
      message: "user not created.",
    });
  }

  return response.status(201).json({
    success: true,
    message: "user created successfully.",
    data: user,
  });
});

//return total number of users.
router.get(`/get/count`, async (request, response) => {
  const userCount = await User.countDocuments();

  if (!userCount) {
    return response
      .status(500)
      .json({ success: false, message: "Internal Error." });
  }
  return response.status(httpStatus.StatusCodes.OK).json({
    success: true,
    message: "Total Users count.",
    count: userCount,
  });
});

// delete User
router.delete("/:userId", (request, response) => {
  if (!mongoose.isValidObjectId(request.params.userId)) {
    return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid User id.",
    });
  }
  User.findByIdAndRemove(request.params.userId)
    .then((user) => {
      if (user) {
        return response
          .status(httpStatus.StatusCodes.OK)
          .json({ success: true, message: "User deleted." });
      } else {
        return response
          .status(httpStatus.StatusCodes.NOT_FOUND)
          .json({ success: false, message: "User not found." });
      }
    })
    .catch((error) => {
      return response
        .status(httpStatus.StatusCodes.BAD_REQUEST)
        .json({ success: false, message: error });
    });
});
module.exports = router;
