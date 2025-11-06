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
  
  // Filter out items where menuItem is null (deleted items)
  cart.items = cart.items.filter(item => item.menuItem !== null);
  
  return cart;
}

export async function addItems(userId, items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Items must be a non-empty array");
  }

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Extract all menuItemIds
  const menuItemIds = items.map(i => i.menuItemId);

  // Validate all menu items exist and are available
  const menuItems = await MenuItem.find({
    _id: { $in: menuItemIds },
    isAvailable: true,
  });

  if (menuItems.length === 0) {
    throw new Error("No valid menu items found");
  }

  if (menuItems.length !== items.length) {
    const foundIds = menuItems.map(m => m._id.toString());
    const notFound = menuItemIds.filter(id => !foundIds.includes(id));
    throw new Error(`Menu items not available or not found: ${notFound.join(", ")}`);
  }

  const menuItemMap = new Map(menuItems.map(i => [i._id.toString(), i]));

  const cart = await getCartByUser(userId);

  for (const item of items) {
    const { menuItemId, quantity = 1 } = item;
    const menuItemDoc = menuItemMap.get(menuItemId);
    if (!menuItemDoc) continue;

    const offer = await offerService.getActiveOffersForMenuItem(menuItemId);

    let finalPrice = menuItemDoc.price;
    let appliedDiscount = 0;
    if (offer) {
      appliedDiscount = offer.discountPercent;
      finalPrice = menuItemDoc.price - (menuItemDoc.price * (offer.discountPercent / 100));
    }

    // Find existing item in cart - check if menuItem exists and is not null
    const existing = cart.items.find(
      (i) => i.menuItem && i.menuItem._id.toString() === menuItemId
    );

    if (existing) {
      existing.quantity += quantity;
      existing.priceAtAddition = finalPrice;
      existing.originalPrice = menuItemDoc.price;
      existing.discountApplied = appliedDiscount;
    } else {
      cart.items.push({
        menuItem: menuItemId,
        quantity,
        priceAtAddition: finalPrice,
        originalPrice: menuItemDoc.price,
        discountApplied: appliedDiscount,
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
  
  // Check if menuItem exists and is not null
  const target = cart.items.find(
    (i) => i.menuItem && i.menuItem._id.toString() === menuItemId
  );
  
  if (!target) throw new Error("Item not in cart");
  
  // Refresh price and check for current offers
  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) throw new Error("Menu item not found");
  
  if (!menuItem.isAvailable) {
    throw new Error("Menu item is no longer available");
  }
  
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
  
  // Filter out the item, checking for null menuItem
  cart.items = cart.items.filter(
    (i) => !i.menuItem || i.menuItem._id.toString() !== menuItemId
  );
  
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
  
  // Only calculate for items with valid menuItem references
  for (const item of cart.items) {
    if (!item.menuItem) continue;
    
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