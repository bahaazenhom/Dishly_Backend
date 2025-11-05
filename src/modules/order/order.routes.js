import express from "express";
import { errorHandler } from "../../middlewares/error.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
  checkout,
  confirm,
  listUserOrders,
  listAllOrders,
  getOrder,
} from "./order.controller.js";
import {
  checkoutSchema,
  confirmSchema,
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
 *     summary: Checkout and create order from authenticated user's cart with offer prices (Customer only)
 *     description: Creates an order from user's cart using prices already calculated with active offers. Requires customer information and delivery details. For cash payment, order is confirmed immediately. For card payment, returns Stripe checkout URL with discounted prices. Uses authenticated user's ID from JWT token.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentMethod, customerFullName, customerEmail, deliveryAddress, phoneNumber]
 *             properties:
 *               paymentMethod: { type: string, enum: [cash, card, online], example: "cash" }
 *               customerFullName: { type: string, example: "John Doe Smith" }
 *               customerEmail: { type: string, format: email, example: "john@example.com" }
 *               deliveryAddress: { type: string, example: "123 Main St, Apt 4B, New York, NY 10001" }
 *               phoneNumber: { type: string, example: "+1234567890" }
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
 *       400: { description: Cart is empty or validation error }
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
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders for authenticated user with pricing details (Customer only)
 *     description: Returns all orders with original prices, discounted prices, and discount percentages applied at time of purchase. Uses authenticated user's ID from JWT token.
 *     security: [{ bearerAuth: [] }]
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
  "/",
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(listUserOrders)
);

/**
 * @swagger
 * /orders/all:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders in the system (Admin only)
 *     description: Returns all orders from all users. Only accessible by admin users. Includes user information (fullName, email) for each order.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: 
 *         description: List of all orders
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
 *       403: { description: Admin access required }
 */
router.get(
  "/all",
  auth(),
  authorizationMiddleware(["admin"]),
  errorHandler(listAllOrders)
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

