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
} from "./cart.validation.js";

const router = express.Router();

/**
 * @swagger
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get authenticated user's cart with offer prices (Customer only)
 *     description: Returns cart with automatic offer discounts applied to items. Each item shows original price, discounted price, and discount percentage. Uses authenticated user's ID from JWT token.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: 
 *         description: Cart retrieved successfully with offer prices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart: { $ref: '#/components/schemas/Cart' }
 *       401: { description: Unauthorized }
 *       403: { description: Customer access required }
 *       404: { description: Cart not found }
 */
router.get(
  "/",
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(getCart)
);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to authenticated user's cart with automatic offer application (Customer only)
 *     description: Adds item to cart and automatically applies active offers/discounts. System checks for best available offer and calculates discounted price. Uses authenticated user's ID from JWT token.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [menuItemId, quantity]
 *             properties:
 *               menuItemId: { type: string, example: "507f1f77bcf86cd799439012" }
 *               quantity: { type: number, minimum: 1, example: 2 }
 *     responses:
 *       201: 
 *         description: Item added to cart with offer applied (if available)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart: { $ref: '#/components/schemas/Cart' }
 *       400: { description: Menu item not available }
 *       401: { description: Unauthorized }
 *       403: { description: Customer access required }
 *       404: { description: Menu item not found }
 */
router.post(
  "/items",
  validationMiddleware(addItemSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(addCartItem)
);

/**
 * @swagger
 * /cart/items:
 *   patch:
 *     tags: [Cart]
 *     summary: Update cart item quantity with offer refresh (Customer only)
 *     description: Updates item quantity and refreshes prices/offers. Automatically reapplies current active offers to ensure up-to-date pricing. Uses authenticated user's ID from JWT token.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [menuItemId, quantity]
 *             properties:
 *               menuItemId: { type: string, example: "507f1f77bcf86cd799439012" }
 *               quantity: { type: number, minimum: 1, example: 3 }
 *     responses:
 *       200: 
 *         description: Cart item updated with current prices and offers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart: { $ref: '#/components/schemas/Cart' }
 *       401: { description: Unauthorized }
 *       403: { description: Customer access required }
 *       404: { description: Item not found in cart }
 */
router.patch(
  "/items",
  validationMiddleware(updateItemSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(updateCartItem)
);

/**
 * @swagger
 * /cart/items:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from authenticated user's cart (Customer only)
 *     description: Removes item from cart. Uses authenticated user's ID from JWT token.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [menuItemId]
 *             properties:
 *               menuItemId: { type: string, example: "507f1f77bcf86cd799439012" }
 *     responses:
 *       200: { description: Item removed from cart }
 *       401: { description: Unauthorized }
 *       403: { description: Customer access required }
 *       404: { description: Item not found in cart }
 */
router.delete(
  "/items",
  validationMiddleware(removeItemSchema),
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(removeCartItem)
);

/**
 * @swagger
 * /cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Clear authenticated user's cart (Customer only)
 *     description: Clears all items from cart. Uses authenticated user's ID from JWT token.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cart cleared successfully }
 *       401: { description: Unauthorized }
 *       403: { description: Customer access required }
 */
router.delete(
  "/",
  auth(),
  authorizationMiddleware(["customer"]),
  errorHandler(clearUserCart)
);

export default router;

