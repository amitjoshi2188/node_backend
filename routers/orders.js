const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");

const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const httpStatus = require("http-status-codes");

//Orders listing.
router.get("/", async (request, response) => {
  const OrderList = await Order.find().select("-__v").populate("user", "name email").sort({ 'dateOrdered': -1 }); //order by descending(newest to oldest) 1 for ascending.
  if (!OrderList) {
    response.send(httpStatus.StatusCodes.BAD_REQUEST).json({ success: false });
  }
  response.status(httpStatus.StatusCodes.OK).json({
    success: true,
    data: OrderList,
  });
});

//Orders by id

router.get("/:orderId", async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.orderId)) {
    return response
      .status(httpStatus.StatusCodes.BAD_REQUEST)
      .json({ success: false, message: "Invalid Order id." });
  }

  const order = await Order.findById(request.params.orderId)
    .select("-__v") //excluding column from listing.
    .populate("user", "name email")
    //    .populate("orderItems");
    .populate({ //as having nested population using this way.
      path: "orderItems", // populate orderItems
      populate: {
        path: "product", // in product, populate product
        populate: "category",
      }
    });

  if (!order) {
    return response
      .status(httpStatus.StatusCodes.NOT_FOUND)
      .json({ success: false, message: "No Order found." });
  }
  return response
    .status(httpStatus.StatusCodes.OK)
    .json({ success: true, data: order });
});

//Create Order

router.post('/', async (request, response) => {
  const orderItemsIds = Promise.all(request.body.orderItems.map(async (orderItem) => {
    let newOrderItem = new OrderItem({
      quantity: orderItem.quantity,
      product: orderItem.product
    })

    newOrderItem = await newOrderItem.save();

    return newOrderItem._id;
  }))

  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
    const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
    const totalPrice = orderItem.product.price * orderItem.quantity;
    return totalPrice
  }));

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: request.body.shippingAddress1,
    shippingAddress2: request.body.shippingAddress2,
    city: request.body.city,
    zip: request.body.zip,
    country: request.body.country,
    phone: request.body.phone,
    status: request.body.status,
    totalPrice: totalPrice,
    user: request.body.user,
  })
  order = await order.save();
  if (!order) {
    return response.status(httpStatus.StatusCodes.NOT_FOUND).json({
      success: false,
      message: "order not created.",
    });
  }

  return response.status(httpStatus.StatusCodes.CREATED).json({
    success: true,
    message: "order created successfully.",
    data: order,
  });
});


// delete Order
router.delete("/:orderId", (request, response) => {
  if (!mongoose.isValidObjectId(request.params.orderId)) {
    return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid Order id.",
    });
  }

  Order.findByIdAndRemove(request.params.orderId).then(async order => {
    if (order) {
      await order.orderItems.map(async orderItem => {
        await OrderItem.findByIdAndRemove(orderItem)
      });

      return response
        .status(httpStatus.StatusCodes.OK)
        .json({ success: true, message: "Order deleted." });
    } else {
      return response
        .status(httpStatus.StatusCodes.NOT_FOUND)
        .json({ success: false, message: "Order not found." });
    }
  })
    .catch((error) => {
      return response
        .status(httpStatus.StatusCodes.BAD_REQUEST)
        .json({ success: false, message: error });
    });
});

// update Order
router.put("/:orderId", async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.orderId)) {
    return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid order id.",
    });
  }
  const order = await Order.findByIdAndUpdate(
    request.params.orderId,
    {
      status: request.body.status
    },
    { new: true } //returns last updated record.
  );

  if (!order) {
    return response.status(400).json({
      success: false,
      message: "Order not updated.",
    });
  }
  return response.status(httpStatus.StatusCodes.OK).json({
    success: true,
    message: "Order updated successfully.",
    data: order,
  });
});

//return total number of Orders.
router.get(`/get/count`, async (request, response) => {
  const orderCount = await Order.countDocuments();

  if (!orderCount) {
    return response
      .status(500)
      .json({ success: false, message: "Internal Error." });
  }

  return response.status(httpStatus.StatusCodes.OK).json({
    success: true,
    message: "Total orders count.",
    count: orderCount,
  });
});

//returns total sales from orders

router.get('/get/totalsales', async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
  ])

  if (!totalSales) {
    return res.status(httpStatus.StatusCodes.BAD_GATEWAY).send('The order sales cannot be generated')
  }

  res.send({ totalsales: totalSales.pop().totalsales })
})

module.exports = router;
