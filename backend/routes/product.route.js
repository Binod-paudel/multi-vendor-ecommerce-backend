import express from "express";
import { checkAdmin, checkAuth } from "../middlewares/auth.middleware.js";
import {
  addProductReview,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getTopProducts,
  updateProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/", checkAuth, checkAdmin, createProduct);
router.get("/:id", checkAuth, getProductById);
router.get("/", getProducts);
router.put("/:id", checkAuth, checkAdmin, updateProduct);
router.delete("/:id", checkAuth, checkAdmin, deleteProduct);
router.post("/top", getTopProducts);
router.post("/:id", checkAuth, addProductReview);

export default router;
