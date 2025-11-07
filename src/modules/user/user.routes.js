import {Router} from "express";
import {UserController} from "./user.controller.js";
import { errorHandler } from "../../middlewares/error.middleware.js";
import {validationMiddleware} from "../../middlewares/validation.middleware.js";
import { confirmEmailSchema, createUserSchema, loginUserSchema, updateUserSchema } from "./user.validation.js";
import { authLimiter } from "../../middlewares/rateLimiter.middleware.js";
import { auth } from "../../middlewares/authentication.middleware.js";
const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /user/register:
 *   post:
 *     tags: [User]
 *     summary: Register a new user
 *     description: Creates a new user account. Rate limited to 5 requests per 10 minutes per IP address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password, age]
 *             properties:
 *               fullName: { type: string, example: "John Doe Smith" }
 *               email: { type: string, example: "john@example.com" }
 *               password: { type: string, example: "Password@123" }
 *               age: { type: number, example: 25 }
 *               phone: { type: string, example: "1234567890" }
 *     responses:
 *       201: 
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "User created. Please confirm your name to activate your account." }
 *                 userId: { type: string, example: "507f1f77bcf86cd799439011" }
 *       400: { description: Validation error }
 *       409: { description: Email already in use }
 *       429: { description: Too many registration attempts, please try again later }
 */
router.post('/register',authLimiter,validationMiddleware(createUserSchema),userController.registerUser);

/**
 * @swagger
 * /user/confirm-email/{userId}:
 *   get:
 *     tags: [User]
 *     summary: Confirm user email and activate account
 *     description: Activates user account and returns access token with refresh token cookie
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *         description: User ID from registration
 *     responses:
 *       200: 
 *         description: Email confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Email confirmed" }
 *                 accessToken: { type: string }
 *       400: { description: Invalid userId }
 *       404: { description: User not found }
 */
router.get('/confirm-email/:userId',validationMiddleware(confirmEmailSchema),userController.confirmEmail);

/**
 * @swagger
 * /user/login:
 *   post:
 *     tags: [User]
 *     summary: User login
 *     description: Authenticate user and return access token. Sets refresh token in httpOnly cookie. Rate limited to 5 requests per 10 minutes per IP address to prevent brute force attacks.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "john@example.com" }
 *               password: { type: string, example: "Password@123" }
 *     responses:
 *       200: 
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Login successful" }
 *                 userToken: { type: string, description: "Access token for authentication" }
 *       401: { description: Invalid credentials or email not confirmed }
 *       429: { description: Too many login attempts, please try again later }
 */
router.post('/login',authLimiter,validationMiddleware(loginUserSchema),userController.loginUser);

/**
 * @swagger
 * /user/refresh:
 *   post:
 *     tags: [User]
 *     summary: Refresh access token
 *     description: Use refresh token from cookie to get new access token
 *     responses:
 *       200: 
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *       401: { description: Refresh token missing }
 *       403: { description: Invalid refresh token }
 */
router.post('/refresh',userController.refreshToken);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     tags: [User]
 *     summary: User logout
 *     description: Invalidates refresh token and clears cookie
 *     responses:
 *       200: 
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Logout successful" }
 *       204: { description: No refresh token to clear }
 */
router.post('/logout',validationMiddleware(loginUserSchema),userController.logoutUser);

/**
 * @swagger
 * /user/me:
 *   get:
 *     tags: [User]
 *     summary: Get current authenticated user details
 *     description: Returns user details from JWT token in Authorization header
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: 
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/User' }
 *       401: { description: Unauthorized - Token missing or invalid }
 *       404: { description: User not found }
 */
router.get('/me',errorHandler(auth()),userController.getCurrentUser);

/**
 * @swagger
 * /user/update:
 *   patch:
 *     tags: [User]
 *     summary: Update current authenticated user details
 *     description: Updates user profile information. Cannot update password, role, isConfirmed, or refreshToken through this endpoint.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string, minLength: 6, maxLength: 50, example: "John Doe Smith" }
 *               email: { type: string, format: email, example: "newemail@example.com" }
 *               age: { type: number, minimum: 0, example: 26 }
 *               phone: { type: string, pattern: "^[0-9]{10,15}$", example: "1234567890" }
 *             minProperties: 1
 *             description: At least one field must be provided for update
 *     responses:
 *       200: 
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "User updated successfully" }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400: { description: Validation error - Invalid input or no fields provided }
 *       401: { description: Unauthorized - Token missing or invalid }
 *       404: { description: User not found }
 */
router.patch('/update',errorHandler(auth()),validationMiddleware(updateUserSchema),userController.updateUser);


export default router;