import { CommentController } from "./comment.controller.js";
import express from "express";
import { auth } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.util.js";
import { errorHandler } from "../../middlewares/error.middleware.js";
const router = express.Router();
const commentController = new CommentController();

/**
 * @swagger
 * /comments:
 *   post:
 *     tags: [Comments]
 *     summary: Create a comment/review (Customer only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, menuItemId, content, rating]
 *             properties:
 *               userId: { type: string, example: "507f1f77bcf86cd799439011" }
 *               menuItemId: { type: string, example: "507f1f77bcf86cd799439012" }
 *               content: { type: string, example: "This pizza was absolutely delicious!" }
 *               rating: { type: number, minimum: 1, maximum: 5, example: 5 }
 *     responses:
 *       201: { description: Comment created successfully }
 *       401: { description: Unauthorized }
 *       403: { description: Customer access required }
 */
router.post('/',errorHandler(auth()),errorHandler(authorizationMiddleware(systemRoles.CUSTOMER)),commentController.createComment);

/**
 * @swagger
 * /comments/menu-item/{menuItemId}:
 *   get:
 *     tags: [Comments]
 *     summary: Get all comments for a specific menu item
 *     parameters:
 *       - in: path
 *         name: menuItemId
 *         required: true
 *         schema: { type: string }
 *         description: Menu item ID
 *     responses:
 *       200: { description: List of comments with average rating }
 *       404: { description: Menu item not found }
 */
router.get('/menu-item/:menuItemId',  commentController.getCommentsByMenuItem);

export default router;