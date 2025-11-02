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

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     tags: [Orders]
 *     summary: Checkout and create order from cart (Customer only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, paymentMethod]
 *             properties:
 *               userId: { type: string, example: "507f1f77bcf86cd799439011" }
 *               paymentMethod: { type: string, enum: [cash, card, online], example: "cash" }
 *     responses:
 *       201: { description: Order created successfully }
 *       400: { description: Cart is empty or invalid }
 *       401: { description: Unauthorized }
 *       403: { description: Customer access required }
 */
router.post(
  "/checkout",
  validationMiddleware(checkoutSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(checkout)
);

/**
 * @swagger
 * /orders/confirm:
 *   post:
 *     tags: [Orders]
 *     summary: Confirm an order (Customer only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId: { type: string, example: "507f1f77bcf86cd799439011" }
 *     responses:
 *       200: { description: Order confirmed successfully }
 *       401: { description: Unauthorized }
 *       403: { description: Customer access required }
 *       404: { description: Order not found }
 */
router.post(
  "/confirm",
  validationMiddleware(confirmSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(confirm)
);

/**
 * @swagger
 * /orders/user/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders for a user (Customer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *         description: User ID
 *     responses:
 *       200: { description: List of user orders }
 *       401: { description: Unauthorized }
 *       403: { description: Customer access required }
 */
router.get(
  "/user/:userId",
  validationMiddleware(listOrdersSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(listUserOrders)
);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order details by ID (Customer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *         description: Order ID
 *     responses:
 *       200: { description: Order details retrieved }
 *       401: { description: Unauthorized }
 *       403: { description: Customer access required }
 *       404: { description: Order not found }
 */
router.get(
  "/:orderId",
  validationMiddleware(getOrderSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(getOrder)
);

export default router;

