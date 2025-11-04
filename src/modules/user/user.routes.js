import {Router} from "express";
import {UserController} from "./user.controller.js";
import { errorHandler } from "../../middlewares/error.middleware.js";
import {validationMiddleware} from "../../middlewares/validation.middleware.js";
import { confirmEmailSchema, createUserSchema, getUserByIdSchema, loginUserSchema, refreshTokenSchema } from "./user.validation.js";
const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /user/register:
 *   post:
 *     tags: [User]
 *     summary: Register a new user
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
 */
router.post('/register',validationMiddleware(createUserSchema),userController.registerUser);

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
 *     description: Authenticate user and return access token. Sets refresh token in httpOnly cookie.
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
 */
router.post('/login',validationMiddleware(loginUserSchema),userController.loginUser);

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
router.post('/refresh',validationMiddleware(refreshTokenSchema),userController.refreshToken);

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
 * /user/me/{token}:
 *   get:
 *     tags: [User]
 *     summary: Get current user by token
 *     description: Returns user details from refresh token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         description: Refresh token
 *     responses:
 *       200: 
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/User' }
 *       400: { description: Token is required }
 *       404: { description: User not found }
 */
router.get('/me/:token',validationMiddleware(getUserByIdSchema),userController.getCurrentUser);


export default router;