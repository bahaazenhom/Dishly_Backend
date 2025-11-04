import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
class PaymentService {
  async createCheckoutSession(products) {
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "EGP",
        product_data: { name: product.name },
        unit_amount: product.price * 100, // convert to cents
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `http://localhost:5000/success`,
      cancel_url: `http://localhost:5000/cancel`,
    });

    return session;
  }

}

export default new PaymentService();
