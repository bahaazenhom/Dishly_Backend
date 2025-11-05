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

    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/order-success?orderId=${orderId}`,
      cancel_url: `${baseUrl}/order-cancel`,
      metadata: {
        orderId: orderId, // Store orderId to identify which order to confirm
        userId: userId,   // Store userId to identify the user
      },
    });

    return session;
  }

  async handleWebhook(payload, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      // Verify webhook signature to ensure it's from Stripe
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      return event;
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
  }

}

export default new PaymentService();
