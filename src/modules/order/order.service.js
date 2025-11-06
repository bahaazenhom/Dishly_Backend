import Order from "../../models/order.model.js";
import Cart from "../../models/cart.model.js";
import paymentService from "../payment/payment.services.js";

export async function createOrderFromCart(userId, orderDetails = {}) {
  const { 
    paymentMethod,
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

  const status = paymentMethod === 'cash' ? 'confirmed' : 'pending';

  const order = new Order({
    user: userId,
    items,
    totalAmount,
    status,
    paymentMethod,
    customerFullName,
    customerEmail,
    deliveryAddress,
    phoneNumber,
  });

  // Create Stripe session *after* creating order instance (has _id now)
  let stripeSession = null;
  if (paymentMethod === "card") {
    stripeSession = await paymentService.createCheckoutSession(
      products, 
      order._id.toString(),
      userId.toString()
    );
    order.stripeSessionId = stripeSession?.id;
  }

  // Save order
  await order.save();

  // Clear cart only for cash orders (card orders cleared after payment webhook)
  if (paymentMethod === 'cash') {
    cart.items = [];
    await cart.save();
  }

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

export async function getAllOrders() {
  return Order.find()
    .populate("items.menuItem")
    .populate("user", "fullName email")
    .sort({ createdAt: -1 });
}

export async function getOrderById(orderId) {
  return Order.findById(orderId).populate("items.menuItem");
}

export async function confirmOrder(orderId) {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { 
      status: "confirmed",
      $unset: { expiresAt: "" }
    },
    { new: true }
  ).populate("items.menuItem");

  if (!order) throw new Error("Order not found");
  return order;
}

// New function: Cancel order
export async function cancelOrder(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  
  if (!order) throw new Error("Order not found");
  if (order.status === "confirmed") {
    throw new Error("Cannot cancel confirmed order");
  }
  
  order.status = "cancelled";
  await order.save();
  
  return order.populate("items.menuItem");
}