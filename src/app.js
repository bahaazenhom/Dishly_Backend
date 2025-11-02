import express from "express";
import cookieParser from "cookie-parser"; 
import userRouter from "./modules/user/user.routes.js";
import menuItemRouter from "./modules/menuItem/menuItem.routes.js";
import offerRouter from "./modules/offer/offer.routes.js";
import commentRouter from "./modules/comment/comment.routes.js";
import cartRouter from "./modules/cart/cart.routes.js";
import orderRouter from "./modules/order/order.routes.js";
import {globaleResponse} from "./middlewares/error.middleware.js";

const app = express();

// global middlewares
app.use(express.json());
app.use(cookieParser());
// register routes
app.use('/user', userRouter);
app.use('/menu-items', menuItemRouter);
app.use('/offers', offerRouter);
app.use('/comments', commentRouter);
app.use('/cart',  cartRouter);
app.use('/orders', orderRouter);
 
// global error handler (must be after routes)
app.use(globaleResponse);

export default app;
