import paymentService from "./payment.services.js";
import { ErrorClass } from "../../utils/error.util.js";
import Order from "../../models/order.model.js";
import Cart from "../../models/cart.model.js";


class PaymentController {
  async createCheckoutSession(req, res, next) {
    try {
      const { products, orderId } = req.body;
      const userId = req.authUser._id;
      if (!products || !Array.isArray(products) || products.length === 0) {
        return next(new ErrorClass("Products array is required", 400, "Validation Error"));
      }

      const session = await paymentService.createCheckoutSession(products, orderId, userId);

      res.status(200).json({ url: session.url, sessionId: session.id });
    } catch (error) {
      next(new ErrorClass(error.message, 500, "Stripe Payment Error"));
    }
  }

  async handleWebhook(req, res) {
    const signature = req.headers['stripe-signature'];

    try {
      // Verify and parse the webhook event
      const event = await paymentService.handleWebhook(req.body, signature);

      // Handle the checkout.session.completed event
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.orderId;
        const userId = session.metadata.userId;

        if (orderId && userId) {
          // Clear user cart after successful payment
          const cart = await Cart.findOne({ user: userId });
          if (cart) {
            console.log("clearing cart items");
            cart.items = [];
            await cart.save();
          }
          
          // Auto-confirm the order
          await Order.findByIdAndUpdate(
            orderId,
            { status: "confirmed",
              $unset: { expiresAt: "" } 
            },
            { new: true }
          );
        }
      }

      // Return 200 to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
}

export default new PaymentController();


