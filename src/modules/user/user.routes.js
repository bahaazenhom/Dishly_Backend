import {Router} from "express";
import {UserController} from "./user.controller.js";
import {validationMiddleware} from "../../middlewares/validation.middleware.js";
import { confirmEmailSchema, createUserSchema, loginUserSchema } from "./user.validation.js";
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
 *             required: [fullName, email, password, repeat_password, gender, age]
 *             properties:
 *               fullName: { type: string, example: "John Doe Smith" }
 *               email: { type: string, example: "john@example.com" }
 *               password: { type: string, example: "Password@123" }
 *               repeat_password: { type: string, example: "Password@123" }
 *               gender: { type: string, enum: [male, female] }
 *               age: { type: number, example: 25 }
 *               phone: { type: string, example: "1234567890" }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Validation error }
 */
router.post('/register',validationMiddleware(createUserSchema),userController.registerUser);

/**
 * @swagger
 * /user/confirm-email/{token}:
 *   get:
 *     tags: [User]
 *     summary: Confirm user email
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Email confirmed }
 *       400: { description: Invalid token }
 */
router.get('/confirm-email/:userId',validationMiddleware(confirmEmailSchema),userController.confirmEmail);

/**
 * @swagger
 * /user/login:
 *   post:
 *     tags: [User]
 *     summary: User login
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
 *       200: { description: Login successful, returns access token }
 *       401: { description: Invalid credentials }
 */
router.post('/login',validationMiddleware(loginUserSchema),userController.loginUser);

export default router;