import express from "express";
import { errorHandler } from "../../middlewares/error.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
  checkout,
  confirm,
  listUserOrders,
  getOrder,
  getOrderBySession,
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
 *     description: Creates an order from user's cart. For cash payment, order is confirmed immediately. For card payment, returns Stripe checkout URL.
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
 *       201: 
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 order: { $ref: '#/components/schemas/Order' }
 *                 checkoutUrl: { type: string, description: "Stripe checkout URL (only for card payment)" }
 *                 sessionId: { type: string, description: "Stripe session ID (only for card payment)" }
 *       400: { description: Cart is empty or invalid }
 *       401: { description: Unauthorized }
 *       403: { description: Customer access required }
 *       500: { description: Failed to create order }
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
 *     summary: Confirm an order payment (Customer only)
 *     description: Confirms an order after successful payment. Changes order status from 'pending' to 'confirmed'.
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
 *       200: 
 *         description: Order confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 order: { $ref: '#/components/schemas/Order' }
 *       400: { description: Failed to confirm order }
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

/**
 * @swagger
 * /orders/success:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by Stripe session ID (Public - for payment success redirect)
 *     description: Called by frontend after successful Stripe payment. Returns order details using session_id from URL.
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *         description: Stripe session ID from redirect URL
 *         example: "cs_test_b1NfjAGehxgGvWJPFiwlstWeX7oxcoUnBzfXFaDRyMVfJadA5RdtNes0jj"
 *     responses:
 *       200: 
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Payment successful! Your order is confirmed." }
 *                 order: { $ref: '#/components/schemas/Order' }
 *       400: { description: Session ID is required }
 *       404: { description: Order not found for this session }
 */
router.get(
  "/success",
  errorHandler(getOrderBySession)
);

export default router;

