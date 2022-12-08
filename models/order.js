const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  totalPrice: {
    type: Number,
    default: 0,
  },
  country: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: false,
  },
  zip: {
    type: String,
    required: true,
  },
  shippingAddress2: {
    type: String,
    required: false,
  },
  shippingAddress1: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", //managing relationship with User Model.
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'Pending',
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", {
  virtuals: true,
});

exports.Order = mongoose.model("Order", orderSchema);

exports.orderSchema = orderSchema;
