import { auth } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.util.js";
import { offerController } from "./offer.controller.js";
import { errorHandler } from "../../middlewares/error.middleware.js";
import express from "express";
const router = express.Router();
const offerCtrl = new offerController();

/**
 * @swagger
 * /offers:
 *   get:
 *     tags: [Offers]
 *     summary: Get all offers
 *     responses:
 *       200: { description: List of all offers with populated menu items }
 */
router.get('/',offerCtrl.getAllOffers);

/**
 * @swagger
 * /offers:
 *   post:
 *     tags: [Offers]
 *     summary: Create a new offer (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, discountPercent, menuItems]
 *             properties:
 *               title: { type: string, example: "Weekend Special" }
 *               imageUrl: { type: string, example: "https://example.com/offer.jpg" }
 *               description: { type: string, example: "Get 20% off on all pizzas this weekend!" }
 *               discountPercent: { type: number, minimum: 1, maximum: 100, example: 20 }
 *               menuItems: { type: array, items: { type: string }, example: ["507f1f77bcf86cd799439011"] }
 *               isActive: { type: boolean, example: true }
 *     responses:
 *       201: { description: Offer created successfully }
 *       401: { description: Unauthorized }
 *       403: { description: Admin access required }
 */
router.post('/',errorHandler(auth()),errorHandler(authorizationMiddleware(systemRoles.ADMIN)),offerCtrl.createOffer);

/**
 * @swagger
 * /offers/{id}:
 *   put:
 *     tags: [Offers]
 *     summary: Update an offer (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Offer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Offer'
 *     responses:
 *       200: { description: Offer updated successfully }
 *       401: { description: Unauthorized }
 *       403: { description: Admin access required }
 *       404: { description: Offer not found }
 */
router.put('/:id',errorHandler(auth()),errorHandler(authorizationMiddleware(systemRoles.ADMIN)),offerCtrl.updateOffer);

/**
 * @swagger
 * /offers/{id}:
 *   delete:
 *     tags: [Offers]
 *     summary: Delete an offer (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Offer ID to delete
 *     responses:
 *       200: { description: Offer deleted successfully }
 *       401: { description: Unauthorized }
 *       403: { description: Admin access required }
 *       404: { description: Offer not found }
 */
router.delete('/:id',errorHandler(auth()),errorHandler(authorizationMiddleware(systemRoles.ADMIN)),offerCtrl.deleteOffer);

export default router;