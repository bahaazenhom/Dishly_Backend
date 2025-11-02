import express from "express";
import { errorHandler } from "../../middlewares/error.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
  checkout,
  confirm,
  listUserOrders,
  getOrder,
} from "./order.controller.js";
import {
  checkoutSchema,
  confirmSchema,
  listOrdersSchema,
  getOrderSchema,
} from "./order.validation.js";
import { auth } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";

const router = express.Router();

router.post(
  "/checkout",
  validationMiddleware(checkoutSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(checkout)
);

router.post(
  "/confirm",
  validationMiddleware(confirmSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(confirm)
);

router.get(
  "/user/:userId",
  validationMiddleware(listOrdersSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(listUserOrders)
);

router.get(
  "/:orderId",
  validationMiddleware(getOrderSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(getOrder)
);

export default router;

