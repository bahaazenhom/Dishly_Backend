import Order from "../../models/order.model.js";
import Cart from "../../models/cart.model.js";

import paymentService from "../payment/payment.services.js";

export async function createOrderFromCart(userId, orderDetails = {}) {
  const { 
    paymentMethod = "cash",
    customerFullName,
    customerEmail,
    deliveryAddress,
    phoneNumber
  } = orderDetails;

  // Validate required delivery details
  if (!customerFullName || !customerEmail || !deliveryAddress || !phoneNumber) {
    throw new Error("Customer information and delivery details are required");
  }

  const cart = await Cart.findOne({ user: userId }).populate("items.menuItem");
  if (!cart || cart.items.length === 0) throw new Error("Cart is empty");

  const items = [];
  let totalAmount = 0;
  const products = [];

  for (const cartItem of cart.items) {
    const item = cartItem.menuItem;
    if (!item) continue;
    
    // Use prices already calculated in cart (refreshed on each update)
    const finalPrice = cartItem.priceAtAddition || item.price;
    const originalPrice = cartItem.originalPrice || item.price;
    const appliedDiscount = cartItem.discountApplied || 0;
    
    items.push({ 
      menuItem: item._id, 
      quantity: cartItem.quantity,
      priceAtPurchase: finalPrice,
      originalPrice: originalPrice,
      discountApplied: appliedDiscount
    });
    
    totalAmount += finalPrice * cartItem.quantity;

    // Prepare products for Stripe with discounted price
    products.push({
      name: appliedDiscount > 0 ? `${item.name} (${appliedDiscount}% OFF)` : item.name,
      price: finalPrice,
      quantity: cartItem.quantity
    });
  }

  const order = await Order.create({
    user: userId,
    items,
    totalAmount,
    status: paymentMethod === "cash" ? "confirmed" : "pending",
    paymentMethod,
    customerFullName,
    customerEmail,
    deliveryAddress,
    phoneNumber,
  });

  // If payment method is card, create Stripe checkout session
  let stripeSession = null;
  if (paymentMethod === "card") {
    console.log('Creating Stripe session for products:', products);
    // Pass orderId to Stripe so webhook can identify which order to confirm
    stripeSession = await paymentService.createCheckoutSession(products, order._id.toString());
    console.log('Stripe session created:', {
      id: stripeSession?.id,
      url: stripeSession?.url
    });
    // Save session ID to order for tracking
    order.stripeSessionId = stripeSession.id;
    await order.save();
  }

  // Clear cart after order creation
  cart.items = [];
  await cart.save();

  console.log('Returning from createOrderFromCart:', {
    hasOrder: !!order,
    hasStripeSession: !!stripeSession
  });

  return {
    order: await order.populate("items.menuItem"),
    stripeSession
  };
}

export async function getUserOrders(userId) {
  return Order.find({ user: userId })
    .populate("items.menuItem")
    .sort({ createdAt: -1 });
}

export async function getOrderById(orderId) {
  return Order.findById(orderId).populate("items.menuItem");
}

export async function confirmOrder(orderId) {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status: "confirmed" },
    { new: true }
  ).populate("items.menuItem");

  if (!order) throw new Error("Order not found");
  return order;
}

export async function getOrderBySessionId(sessionId) {
  return Order.findOne({ stripeSessionId: sessionId }).populate("items.menuItem");
}
