import express from "express";
import errorHandler from "./middlewares/error.Middleware.js";
import notFoundHandler from "./middlewares/notFound.middleware.js";

import logger from "./middlewares/logger.js";
import cookieParser from "cookie-parser";

//router import
import userRouter from "./routes/user.router.js";
import productRouter from "./routes/product.route.js";
import orderRouter from "./routes/order.route.js"

const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

//routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);

//errorHandler
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
