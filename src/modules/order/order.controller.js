import {
  createOrderFromCart,
  getUserOrders,
  getOrderById,
  confirmOrder,
  getOrderBySessionId,
} from "./order.service.js";

export const checkout = async (req, res) => {
  try {
    const { userId, paymentMethod = "cash" } = req.body;

    // Create order from cart
    const result = await createOrderFromCart(userId, { paymentMethod });

    console.log('Checkout result:', {
      hasOrder: !!result.order,
      hasStripeSession: !!result.stripeSession,
      stripeSessionUrl: result.stripeSession?.url,
      paymentMethod
    });

    if (paymentMethod === "cash") {
      return res.status(201).json({
        message: "Order created successfully",
        order: result.order
      });
    }

    // For card payment, return order and Stripe checkout URL
    return res.status(201).json({
      message: "Order created. Complete payment to confirm.",
      order: result.order,
      checkoutUrl: result.stripeSession?.url,
      sessionId: result.stripeSession?.id
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      message: "Failed to create order",
      error: error.message
    });
  }
};

export const confirm = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await confirmOrder(orderId);

    res.json({
      message: "Order confirmed successfully",
      order
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to confirm order",
      error: error.message
    });
  }
};

export const listUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await getUserOrders(userId);
    res.json({ orders });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message
    });
  }
};

export const checkOrderStatusWithSessionId = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const order = await getOrderBySessionId(sessionId);

    if (!order) {
      return res.status(404).json({ message: "Order not found for this session" });
    }

    if (order.status !== "confirmed") {
      return res.status(200).json({
        message: "Payment is still pending. Please complete the payment.",
        order
      });
    }

    res.json({
      message: "Payment successful! Your order is confirmed.",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message
    });
  }
};

