import express from "express";
import { errorHandler } from "../../middlewares/error.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
  addCartItem,
  getCart,
  updateCartItem,
  removeCartItem,
  clearUserCart,
} from "./cart.controller.js";
import {
  addItemSchema,
  updateItemSchema,
  removeItemSchema,
  getCartSchema,
  clearCartSchema,
} from "./cart.validation.js";

const router = express.Router();

router.get(
  "/:userId",
  validationMiddleware(getCartSchema),
  errorHandler(getCart)
);

router.post(
  "/items",
  validationMiddleware(addItemSchema),
  errorHandler(addCartItem)
);

router.patch(
  "/items",
  validationMiddleware(updateItemSchema),
  errorHandler(updateCartItem)
);

router.delete(
  "/items",
  validationMiddleware(removeItemSchema),
  errorHandler(removeCartItem)
);

router.delete(
  "/:userId",
  validationMiddleware(clearCartSchema),
  errorHandler(clearUserCart)
);

export default router;

