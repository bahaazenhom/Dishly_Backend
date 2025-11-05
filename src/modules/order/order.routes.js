import express from "express";
import { errorHandler } from "../../middlewares/error.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
  checkout,
  confirm,
  listUserOrders,
  getOrder,
  checkOrderStatusWithSessionId,
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
 *     summary: Checkout and create order from cart with offer prices (Customer only)
 *     description: Creates an order from user's cart using prices already calculated with active offers. For cash payment, order is confirmed immediately. For card payment, returns Stripe checkout URL with discounted prices.
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
 *         description: Order created successfully with offer discounts applied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 order: { $ref: '#/components/schemas/Order' }
 *                 checkoutUrl: { type: string, description: "Stripe checkout URL with discounted prices (only for card payment)" }
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
 *     summary: Get all orders for a user with pricing details (Customer only)
 *     description: Returns all orders with original prices, discounted prices, and discount percentages applied at time of purchase.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *         description: User ID
 *     responses:
 *       200: 
 *         description: List of user orders with price breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
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
 * /orders/checkOrderStatus:
 *   get:
 *     tags: [Orders]
 *     summary: Check order status by Stripe session ID (Public - for payment verification)
 *     description: Checks order status after Stripe redirect. Returns order details regardless of status. Called by frontend after Stripe redirects to success URL.
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
 *       500: { description: Failed to fetch order }
 */
router.get(
  "/checkOrderStatus",
  errorHandler(checkOrderStatusWithSessionId)
);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order details by ID with pricing breakdown (Customer only)
 *     description: Returns detailed order information including original prices, discounted prices, and discount percentages for each item.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *         description: Order ID
 *     responses:
 *       200: 
 *         description: Order details retrieved with price breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order: { $ref: '#/components/schemas/Order' }
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

