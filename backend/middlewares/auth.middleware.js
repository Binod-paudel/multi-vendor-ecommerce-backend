import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.middleware.js";
import User from "../models/user.model.js";
import apiError from "../utils/apiError.js";

const checkAuth = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;
  if (!token) {
    throw new apiError(401, "you must be logged in!");
  }
  try {
    let { userId } = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById(userId);
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (err) {
    throw new apiError(401, "Invalid Token!");
  }
});

const checkAdmin = asyncHandler(async (req, res, next) => {
  let role = req.user?.role;
  if (role) next();
  else {
    let err = new Error("you are not authorized to perform this operation!");
    err.status = 403;
    throw err;
  }
});
const checkVendor = asyncHandler(async (req, res, next) => {
  if (req.user?.role === "vendor") {
    next();
  } else {
    throw new apiError(
      403,
      "Only vendors are allowed to perform this operation!"
    );
  }
});

export { checkAuth, checkAdmin, checkVendor };
