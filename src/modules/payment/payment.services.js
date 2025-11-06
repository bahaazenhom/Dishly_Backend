import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
class PaymentService {
  async createCheckoutSession(products, orderId = null, userId = null) {
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "EGP",
        product_data: { name: product.name },
        unit_amount: product.price * 100, // convert to cents
      },
      quantity: product.quantity,
    }));

    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/order-success/${orderId}`,
      cancel_url: `${baseUrl}/order-cancel`,
      metadata: {
        orderId: orderId, // Store orderId to identify which order to confirm
        userId: userId, // Store userId to identify the user
      },
    });

    return session;
  }

  async handleWebhook(rawBody, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      return event; // verified event
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
  }
}

export default new PaymentService();
