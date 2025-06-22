import Product from "../models/product.model.js";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import apiError from "../utils/apiError.js";

//@desc get all products
//@route POST/api/v/products
//@access public
const getProducts = asyncHandler(async (req, res) => {
  let { keyword, category, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }
  if (category) filter.category = category;

  //vendor filter
  if (req.user?.role === "vendor") {
    filter.user = req.user._id;
  }

  const products = await Product.find(filter)
    .limit(limit)
    .skip((page - 1) * limit)
    .populate("user", "name");

  const count = await Product.countDocuments(filter);
  res.json({
    success: true,
    count,
    pages: Math.ceil(count / limit),
    data: products,
  });
});

//@desc get product by id
//@route GET/api/v/products/:id
//@access public
const getProductById = asyncHandler(async (req, res) => {
  let id = req.params.id;
  let product = await Product.findById(id);
  if (!product) throw new apiError(404, "Product not Found!");
  res.send(product);
});

//@desc create Product
//@route POST/api/v/products
//@access private/admin/vendor

const createProduct = asyncHandler(async (req, res) => {
  let product = await Product.create({
    ...req.body,
    user: req.user._id,
  });
  res.send({ message: "product created successfully!", product });
});

//@desc update product
//@route PUT/api/v1/products
//@access private/admin
const updateProduct = asyncHandler(async (req, res) => {
  let id = req.params.id;
  let product = await Product.findById(id);
  if (!product) {
    throw new apiError(404, "product not found");
  }
  product.name = req.body.name || product.name;
  product.description = req.body.description || product.description;
  product.price = req.body.price || product.price;
  product.category = req.body.category || product.category;
  product.brand = req.body.brand || product.brand;
  product.image = req.body.image || product.image;
  product.stock = req.body.stock || product.stock;

  let updatedProduct = await product.save();

  res.send({
    message: "Product updated successfully!",
    product: updatedProduct,
  });
});

//@desc delete product
//@route DELETE/api/v1/products
//@access private/admin
const deleteProduct = asyncHandler(async (req, res) => {
  let id = req.params.id;
  let product = await Product.findById(id);
  if (!product) throw new apiError(404, "product not found!");
  await Product.findByIdAndDelete(id);
  res.send({ message: "product deleted successfully!" });
});

//@desc get top rated product
//@route POST/api/v1/products/top/:limit
//@access public
const getTopProducts = asyncHandler(async (req, res) => {
  let limit = 3;
  let products = await Product.find({}).sort({ rating: -1 }).limit(limit);
  res.send(products)
});

//@desc add user review
//@route POST/api/v1/products/:id/reviews
//@access private
const addProductReview = asyncHandler(async (req, res) => {
  let id = req.params.id;
  let product = await Product.findById(id);
  if (!product) {
    throw new apiError(404, "product not found!");
  }
  let alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) throw new apiError(400, "Product already reviewed!");

  //add reviews
  let { rating, comment } = req.body;
  product.reviews.push({
    name: req.user.name,
    rating,
    comment,
    user: req.user._id,
  });
  product.numReviews = product.reviews.length;
  let totalRating = product.reviews.reduce(
    (acc, review) => acc + review.rating,
    0
  );
  product.rating = (totalRating / product.reviews.length).toFixed(2);
  await product.save();
  res.send({ message: "product reviewed successfully!" });
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  addProductReview,
};
