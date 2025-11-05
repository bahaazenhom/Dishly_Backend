import express from 'express';
import { MenuItemController } from './menuItem.controller.js';
import { auth } from '../../middlewares/authentication.middleware.js';
import { authorizationMiddleware } from '../../middlewares/authorization.middleware.js';
import { systemRoles } from '../../utils/system-roles.util.js';
import { errorHandler } from "../../middlewares/error.middleware.js";
const router = express.Router();
const menuItemController = new MenuItemController();

/**
 * @swagger
 * /menu-items:
 *   post:
 *     tags: [Menu Items]
 *     summary: Create menu item (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItem'
 *     responses:
 *       201: { description: Menu item created }
 *       401: { description: Unauthorized }
 *       403: { description: Admin access required }
 */
router.post('/',errorHandler(auth()),errorHandler(authorizationMiddleware(systemRoles.ADMIN)),menuItemController.createMenuItem);

/**
 * @swagger
 * /menu-items:
 *   get:
 *     tags: [Menu Items]
 *     summary: Get all menu items
 *     responses:
 *       200: { description: List of menu items }
 */
router.get('/',menuItemController.getAllMenuItemsAndOfferMenuItem);

router.get('/all',menuItemController.getAllMenuItems);
/**
 * @swagger
 * /menu-items/category/{category}:
 *   get:
 *     tags: [Menu Items]
 *     summary: Get menu items by category
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema: { type: string, enum: [meal, appetizer, dessert, drink] }
 *     responses:
 *       200: { description: Filtered menu items }
 */
router.get('/category/:category', menuItemController.getMenuItemsByCategory);

/**
 * @swagger
 * /menu-items/{id}:
 *   put:
 *     tags: [Menu Items]
 *     summary: Update menu item (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItem'
 *     responses:
 *       200: { description: Menu item updated }
 *       401: { description: Unauthorized }
 *       403: { description: Admin access required }
 */
router.put('/:id',errorHandler(auth()),authorizationMiddleware(systemRoles.ADMIN),menuItemController.updateMenuItem);

/**
 * @swagger
 * /menu-items/{id}:
 *   delete:
 *     tags: [Menu Items]
 *     summary: Delete menu item (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Menu item deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Admin access required }
 */
router.delete('/:id',errorHandler(auth()),errorHandler(authorizationMiddleware(systemRoles.ADMIN)),menuItemController.deleteMenuItem);

export default router;