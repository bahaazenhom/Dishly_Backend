import {
  addItem,
  getCartByUser,
  updateItemQuantity,
  removeItem,
  clearCart,
} from "./cart.service.js";

export const getCart = async (req, res) => {
  const userId = req.authUser._id;
  const cart = await getCartByUser(userId);
  res.json({ cart });
};

export const addCartItem = async (req, res) => {
  const userId = req.authUser._id;
  const { menuItemId, quantity, items } = req.body;
  
  // Support both single item and array of items
  if (items && Array.isArray(items)) {
    // Multiple items
    const cart = await addItem(userId, items);
    res.status(201).json({ cart, message: `${items.length} items added to cart` });
  } else if (menuItemId) {
    // Single item
    const cart = await addItem(userId, menuItemId, quantity);
    res.status(201).json({ cart });
  } else {
    res.status(400).json({ error: "Either menuItemId or items array is required" });
  }
};

export const updateCartItem = async (req, res) => {
  const userId = req.authUser._id;
  const { menuItemId, quantity } = req.body;
  const cart = await updateItemQuantity(userId, menuItemId, quantity);
  res.json({ cart });
};

export const removeCartItem = async (req, res) => {
  const userId = req.authUser._id;
  const { menuItemId } = req.body;
  const cart = await removeItem(userId, menuItemId);
  res.json({ cart });
};

export const clearUserCart = async (req, res) => {
  const userId = req.authUser._id;
  const cart = await clearCart(userId);
  res.json({ cart });
};

