import Order from "../models/order.model";
import Product from "../models/product.model.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import ApiError from "../utils/apiError.js";

// @desc    Get vendor dashboard
// @route   GET /api/vendor/dashboard
// @access  Private/Vendor
export const getDashboard = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  
  // Get vendor products
  const products = await Product.find({ user: vendorId });
  
  // Get orders with vendor products
  const orders = await Order.find({
    "orderItems.product": { $in: products.map(p => p._id) }
  }).populate("user", "name email");
  
  // Calculate metrics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  
  const totalRevenue = orders.reduce((total, order) => {
    const vendorItems = order.orderItems.filter(item => 
      products.some(p => p._id.equals(item.product))
    );
    return total + vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, 0);
  
  res.json({
    success: true,
    data: {
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders: orders.slice(0, 5)
    }
  });
});

// @desc    Get vendor products
// @route   GET /api/vendor/products
// @access  Private/Vendor
export const getVendorProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user._id });
  res.json({ success: true, count: products.length, data: products });
});

// @desc    Get vendor orders
// @route   GET /api/vendor/orders
// @access  Private/Vendor
export const getVendorOrders = asyncHandler(async (req, res) => {
  // Get vendor products
  const products = await Product.find({ user: req.user._id });
  
  // Get orders with vendor products
  const orders = await Order.find({
    "orderItems.product": { $in: products.map(p => p._id) }
  }).populate("user", "name email");
  
  res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Update order item status
// @route   PUT /api/vendor/orders/:orderId/items/:itemId
// @access  Private/Vendor
export const updateOrderItemStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { orderId, itemId } = req.params;
  
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  
  const item = order.orderItems.find(item => item._id.toString() === itemId);
  if (!item) throw new ApiError(404, "Item not found");
  
  // Verify vendor owns the product
  const product = await Product.findById(item.product);
  if (!product || product.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }
  
  item.status = status;
  await order.save();
  
  res.json({ success: true, data: order });
});