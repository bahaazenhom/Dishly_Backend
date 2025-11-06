import {
  createOrderFromCart,
  getUserOrders,
  getAllOrders,
  getOrderById,
  confirmOrder,
  cancelOrder,
} from "./order.service.js";

export const checkout = async (req, res) => {
  try {
    const userId = req.authUser._id;
    const { 
      paymentMethod,
      customerFullName,
      customerEmail,
      deliveryAddress,
      phoneNumber, 
    } = req.body;
    
    // Create order from cart with delivery details
    const result = await createOrderFromCart(userId, { 
      paymentMethod,
      customerFullName,
      customerEmail,
      deliveryAddress,
      phoneNumber
    });

    if (paymentMethod === "cash") {
      return res.status(201).json({
        message: "Order created and confirmed successfully",
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

export const cancel = async (req, res) => {
  try {
    const userId = req.authUser._id;
    const { orderId } = req.body;
    
    const order = await cancelOrder(orderId, userId);

    res.json({
      message: "Order cancelled successfully",
      order
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to cancel order",
      error: error.message
    });
  }
};

export const listUserOrders = async (req, res) => {
  try {
    const userId = req.authUser._id;
    const orders = await getUserOrders(userId);
    res.json({ orders });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};

export const listAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json({ orders });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch all orders",
      error: error.message
    });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json({ order });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message
    });
  }
};