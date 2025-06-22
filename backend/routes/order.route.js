import express from "express";
import { checkAuth, checkAdmin } from "../middlewares/auth.middleware.js";
import {
  addOrders,
  getMyOrders,
  getOrders,
  getOrdersById,
  updateOrders,
} from "../controllers/order.controller.js";

const router = express.Router();
router.post("/", checkAuth, addOrders);
router.get("/", checkAuth, getOrders);
router.get("/my-orders", checkAuth, getMyOrders);
router.get("/:id", checkAuth, getOrdersById);
router.put("/:id", checkAuth, updateOrders)


export default router;
