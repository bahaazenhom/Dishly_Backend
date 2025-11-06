import express from "express";
import paymentController from "./payment.controller.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { checkoutSchema } from "./payment.validation.js";
import { auth } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.util.js";

const router = express.Router();

/**
 * @swagger
 * /payment/checkout:
 *   post:
 *     tags: [Payment]
 *     summary: Create Stripe checkout session (Customer only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [products]
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [name, price, quantity]
 *                   properties:
 *                     name: { type: string, example: "Burger" }
 *                     price: { type: number, example: 50 }
 *                     quantity: { type: number, example: 2 }
 *               orderId: { type: string, example: "507f1f77bcf86cd799439011" }
 *     responses:
 *       200: 
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url: { type: string, description: "Stripe checkout URL" }
 *                 sessionId: { type: string, description: "Stripe session ID" }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Customer access required }
 *       500: { description: Stripe payment error }
 */
router.post("/checkout",express.raw({ type: "application/json" }), validationMiddleware(checkoutSchema), auth(), authorizationMiddleware(systemRoles.CUSTOMER), paymentController.createCheckoutSession);

export default router;