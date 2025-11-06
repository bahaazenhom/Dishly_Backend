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
        return next(
          new ErrorClass("Products array is required", 400, "Validation Error")
        );
      }

      const session = await paymentService.createCheckoutSession(
        products,
        orderId,
        userId
      );

      res.status(200).json({ url: session.url, sessionId: session.id });
    } catch (error) {
      next(new ErrorClass(error.message, 500, "Stripe Payment Error"));
    }
  }
  async handleWebhook(req, res) {
    const signature = req.headers["stripe-signature"];

    try {
      // Verify and parse webhook
      const event = await paymentService.handleWebhook(req.body, signature);

      // ✅ Handle successful payment
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderId = session.metadata.orderId;
        const userId = session.metadata.userId;

        if (orderId && userId) {
          console.log("Payment success, confirming order & clearing cart...");

          // Clear user cart
          const cart = await Cart.findOne({ user: userId });
          if (cart) {
            cart.items = [];
            await cart.save();
          }

          // Update order status
          await Order.findByIdAndUpdate(
            orderId,
            {
              status: "confirmed",
              $unset: { expiresAt: "" },
            },
            { new: true }
          );

          console.log("Order confirmed and cart cleared.");
        }
      }

      // ✅ Handle failed or expired sessions
      if (event.type === "checkout.session.expired") {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        await Order.findByIdAndUpdate(orderId, { status: "cancelled" });
        console.log("Order marked as cancelled.");
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
}

export default new PaymentController();
