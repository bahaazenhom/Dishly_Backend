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
  const { menuItemId, quantity } = req.body;
  const cart = await addItem(userId, menuItemId, quantity);
  res.status(201).json({ cart });
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

