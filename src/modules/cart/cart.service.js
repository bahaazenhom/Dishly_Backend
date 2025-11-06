import Cart from "../../models/cart.model.js";
import MenuItem from "../../models/menuItem.model.js";
import User from "../../models/user.model.js";
import { OfferService } from "../offer/offer.service.js";

const offerService = new OfferService();

export async function getCartByUser(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.menuItem");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate("items.menuItem");
  }
  return cart;
}

export async function addItem(userId, menuItemId, quantity = 1) {
  // Support both single item and array of items
  if (Array.isArray(menuItemId)) {
    return addItems(userId, menuItemId);
  }

  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem || !menuItem.isAvailable) {
    throw new Error("Menu item not available");
  }

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Check for active offers
  const offer = await offerService.getActiveOffersForMenuItem(menuItemId);
  
  let finalPrice = menuItem.price;
  let appliedDiscount = 0;
  
  if (offer) {
    // Calculate discounted price
    appliedDiscount = offer.discountPercent;
    finalPrice = menuItem.price - (menuItem.price * (offer.discountPercent / 100));
  }

  const cart = await getCartByUser(userId);
  const existing = cart.items.find((i) => i.menuItem?._id.toString() === menuItemId);
  
  if (existing) {
    existing.quantity += quantity;
    // Update prices in case offer changed
    existing.priceAtAddition = finalPrice;
    existing.originalPrice = menuItem.price;
    existing.discountApplied = appliedDiscount;
  } else {
    cart.items.push({ 
      menuItem: menuItemId, 
      quantity,
      priceAtAddition: finalPrice,
      originalPrice: menuItem.price,
      discountApplied: appliedDiscount
    });
  }
  
  await cart.save();
  return cart.populate("items.menuItem");
}

export async function addItems(userId, items) {
  // items should be an array of objects: [{ menuItemId, quantity }]
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Items must be a non-empty array");
  }

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Validate all menu items first
  const menuItemIds = items.map(item => item.menuItemId);
  const menuItems = await MenuItem.find({ 
    _id: { $in: menuItemIds },
    isAvailable: true 
  });

  if (menuItems.length !== items.length) {
    throw new Error("One or more menu items not available");
  }

  // Create a map for quick lookup
  const menuItemMap = new Map(menuItems.map(item => [item._id.toString(), item]));

  const cart = await getCartByUser(userId);

  // Process each item
  for (const item of items) {
    const { menuItemId, quantity = 1 } = item;
    const menuItem = menuItemMap.get(menuItemId.toString());

    if (!menuItem) continue;

    // Check for active offers
    const offer = await offerService.getActiveOffersForMenuItem(menuItemId);
    
    let finalPrice = menuItem.price;
    let appliedDiscount = 0;
    
    if (offer) {
      appliedDiscount = offer.discountPercent;
      finalPrice = menuItem.price - (menuItem.price * (offer.discountPercent / 100));
    }

    const existing = cart.items.find((i) => i.menuItem?._id.toString() === menuItemId.toString());
    
    if (existing) {
      existing.quantity += quantity;
      existing.priceAtAddition = finalPrice;
      existing.originalPrice = menuItem.price;
      existing.discountApplied = appliedDiscount;
    } else {
      cart.items.push({ 
        menuItem: menuItemId, 
        quantity,
        priceAtAddition: finalPrice,
        originalPrice: menuItem.price,
        discountApplied: appliedDiscount
      });
    }
  }
  
  await cart.save();
  return cart.populate("items.menuItem");
}

export async function updateItemQuantity(userId, menuItemId, quantity) {
  if (quantity < 1) {
    return removeItem(userId, menuItemId);
  }
  
  const cart = await getCartByUser(userId);
  const target = cart.items.find((i) => i.menuItem._id.toString() === menuItemId);
  if (!target) throw new Error("Item not in cart");
  
  // Refresh price and check for current offers
  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) throw new Error("Menu item not found");
  
  const offer = await offerService.getActiveOffersForMenuItem(menuItemId);
  
  let finalPrice = menuItem.price;
  let appliedDiscount = 0;
  
  if (offer) {
    appliedDiscount = offer.discountPercent;
    finalPrice = menuItem.price - (menuItem.price * (offer.discountPercent / 100));
  }
  
  target.quantity = quantity;
  target.priceAtAddition = finalPrice;
  target.originalPrice = menuItem.price;
  target.discountApplied = appliedDiscount;
  
  await cart.save();
  return cart.populate("items.menuItem");
}

export async function removeItem(userId, menuItemId) {
  const cart = await getCartByUser(userId);
  cart.items = cart.items.filter((i) => i.menuItem._id.toString() !== menuItemId);
  await cart.save();
  return cart.populate("items.menuItem");
}

export async function clearCart(userId) {
  const cart = await getCartByUser(userId);
  cart.items = [];
  await cart.save();
  return cart.populate("items.menuItem");
}

export async function getCartWithTotals(userId) {
  const cart = await getCartByUser(userId);
  
  let subtotal = 0;
  let totalDiscount = 0;
  let total = 0;
  
  for (const item of cart.items) {
    const itemOriginalTotal = item.originalPrice * item.quantity;
    const itemDiscountedTotal = item.priceAtAddition * item.quantity;
    
    subtotal += itemOriginalTotal;
    total += itemDiscountedTotal;
  }
  
  totalDiscount = subtotal - total;
  
  return {
    cart,
    totals: {
      subtotal: subtotal.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      total: total.toFixed(2),
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
    }
  };
}
