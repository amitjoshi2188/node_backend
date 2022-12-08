const mongoose = require("mongoose");
const express = require("express");
const app = express();
const { request, response } = require("express");

const httpStatus = require("http-status-codes");

function sum(x, y) {
  return x + y;
}

// function validateObjectId(objectId) {
//     console.log('helper '+objectId);
//   if (!mongoose.isValidObjectId(objectId)) {
//       console.log('if :');
//     return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
//       success: false,
//       message: "Invalid Category id.",
//     });
//   }else{
//     console.log('else :');
//   }
// }
module.exports = { sum };
