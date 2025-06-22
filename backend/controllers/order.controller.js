import Order from "../models/order.model.js";
import apiError from "../utils/apiError.js";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";

//@desc add order
//@route POST/api/v1/orders
//@access private
const addOrders = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemPrice,
    taxPrice,
    shippingCharge,
    totalPrice,
  } = req.body;

  let order = await Order.create({
    user: req.user._id,
    orderItems: orderItems.map((item) => ({
      ...item,
      product: item._id,
      _id: undefined,
    })),
    itemPrice,
    taxPrice,
    shippingCharge,
    totalPrice,
    shippingAddress,
    paymentMethod,
  });

  res.send({
    message: "Order placed with id " + order._id,
    orderId: order._id,
  });
});

//@desc get an orders
//@route GET/api/v1/orders
//@access private
const getOrders = asyncHandler(async (req, res) => {
  let orders = await Order.find({}).populate("user", "name email -_id");
  res.send(orders);
});

//@desc get an orders by Id
//@route GET/api/v1/orders/:id
//@access private
const getOrdersById = asyncHandler(async (req, res) => {
  let id = req.params.id;
  let orders = await Order.findById(id).populate("user", "name email _-id");
  res.send(orders);
});

//@desc get my orders
//@route GET/api/v1/orders/my-orders
//@access private
const getMyOrders = asyncHandler(async (req, res) => {
  let orders = await Order.find({ user: req.user._id });
  res.send(orders);
});

//@desc updateorderstatus
//@route PUT/api/v1/orders/:id
//@access private

const updateOrders = asyncHandler(async (req, res) => {
  let id = req.params.id;
  let { status } = req.body;
  let order = await Order.findById(id);
  if (!order) throw new apiError(404, "Order not found!");

  //update order-level status
  order.status = status;
  if (status === "delivered") {
    order.isDelivered = true;
    order.isPaid = true;
    order.deliveredAt = Date.now();
    order.paidAt = Date.now();
  }
  await order.save();

  res.send({ message: `Order status updated to ${status}`, data: order });
});
export { addOrders, getOrders, getOrdersById, getMyOrders, updateOrders };
