import express from "express";
import paymentController from "./payment.controller.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { checkoutSchema } from "./payment.validation.js";
import { auth } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.util.js";

const router = express.Router();

router.post("/checkout",validationMiddleware(checkoutSchema),auth(),authorizationMiddleware(systemRoles.CUSTOMER),paymentController.createCheckoutSession);

export default router;