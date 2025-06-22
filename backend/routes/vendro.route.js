import express from "express";
import {
  getDashboard,
  getVendorProducts,
  getVendorOrders,
  updateOrderItemStatus
} from "../controllers/vendor.controller.js";
import { checkAuth, checkVendor } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(checkAuth, checkVendor);

router.get("/dashboard", getDashboard);
router.get("/products", getVendorProducts);
router.get("/orders", getVendorOrders);
router.put("/orders/:orderId/items/:itemId", updateOrderItemStatus);

export default router;