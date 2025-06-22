import express from "express";
import {
  signup,
  login,
  logout,
  getUsers,
  updateUserProfile,
  updateUser,
  deleteUser,
  getPendingVendors,
} from "../controllers/user.controller.js";
import { checkAuth, checkAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/", checkAuth, checkAdmin, getUsers);
router.put("/", checkAuth, updateUserProfile);
router.put("/:id", checkAuth, checkAdmin, updateUser);
router.delete("/:id", checkAuth, checkAdmin, deleteUser);
router.get("/vendors", checkAuth, checkAdmin, getPendingVendors);

export default router;
