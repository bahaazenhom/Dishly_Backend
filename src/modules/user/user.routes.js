import {Router} from "express";
import {UserController} from "./user.controller.js";
import {validationMiddleware} from "../../middlewares/validation.middleware.js";
import { confirmEmailSchema, createUserSchema, loginUserSchema } from "./user.validation.js";
const router = Router();
const userController = new UserController();

// register user
router.post('/register',validationMiddleware(createUserSchema),userController.registerUser);
// confirm email
router.get('/confirm-email/:token',validationMiddleware(confirmEmailSchema),userController.confirmEmail);
// login user
router.post('/login',validationMiddleware(loginUserSchema),userController.loginUser);

export default router;