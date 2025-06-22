import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import User from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import ApiError from "../utils/apiError.js";
import createToken from "../utils/token.util.js";

// @desc    Register new user
// @route   POST /api/v1/users/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, `User with email ${email} already exists`);
  }

  const user = await User.create({ name, email, password, role });

  createToken(res, user._id);

  res.status(201).json({
    message: "User registered successfully",
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @desc    Login user
// @route   POST /api/v1/users/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  createToken(res, user._id);

  res.status(200).json({
    message: "Login successful",
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @desc    Logout user
// @route   POST /api/v1/users/logout
// @access  Public
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logout successful" });
});

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.send(users);
});

//@desc update User Profile
//@route PUT/api/v1/users/
//@access private
const updateUserProfile = asyncHandler(async (req, res) => {
  let id = req.user._id;
  let user = await User.findById(id);
  if (!user) throw new apiError(404, "User not Found");

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password) user.password = req.body.password;

  let updatedUser = await user.save();

  res.send({
    message: "User updated!",
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  });
});

//@desc update User
//@route PUT/api/v1/users/:id
//@access private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) throw new ApiError(404, "User not Found!");

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  user.status = req.body.status || user.status;
  user.isApproved = req.body.isApproved ?? user.isApproved;

  const updatedUser = await user.save();

  res.status(200).json({
    message: "User updated successfully",
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      isApproved: updatedUser.isApproved,
    },
  });
});

//@desc delete User
//@route DELETE/api/v1/users
//@access private/admin

const deleteUser = asyncHandler(async (req, res) => {
  let id = req.params.id;
  let user = await User.findById(id);
  if (!user) throw new apiError(404, "User not found!");
  if (user.role === "admin") throw new apiError(400, "Cannot delete admin");

  await user.deleteOne();
  res.send({ message: "user deleted" });
});

//@desc get pending vendor
//@route GET/api/v1/users/vendor/pending
//@access Private/Admin
const getPendingVendors = asyncHandler(async (req, res) => {
  let vendors = await User.find({
    role: "vendor",
    isApproved: false,
  }).select("-password");
  res.send({
    success: true,
    count: vendors.length,
    data: vendors,
  });
});

export {
  signup,
  login,
  logout,
  getUsers,
  updateUserProfile,
  updateUser,
  deleteUser,
  getPendingVendors,
};
