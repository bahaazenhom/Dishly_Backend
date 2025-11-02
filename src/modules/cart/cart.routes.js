import express from "express";
import { errorHandler } from "../../middlewares/error.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { auth } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
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
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(getCart)
);

router.post(
  "/items",
  validationMiddleware(addItemSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(addCartItem)
);

router.patch(
  "/items",
  validationMiddleware(updateItemSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(updateCartItem)
);

router.delete(
  "/items",
  validationMiddleware(removeItemSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(removeCartItem)
);

router.delete(
  "/:userId",
  validationMiddleware(clearCartSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(clearUserCart)
);

export default router;

