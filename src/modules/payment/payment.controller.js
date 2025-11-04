import paymentService from "./payment.services.js";
import { ErrorClass } from "../../utils/error.util.js";


class PaymentController {
  async createCheckoutSession(req, res, next) {
    try {
      const { products } = req.body;

      if (!products || !Array.isArray(products) || products.length === 0) {
        return next(new ErrorClass("Products array is required", 400, "Validation Error"));
      }

      const session = await paymentService.createCheckoutSession(products);

      res.status(200).json({ url: session.url });
    } catch (error) {
      next(new ErrorClass(error.message, 500, "Stripe Payment Error"));
    }
  }
}

export default new PaymentController();


