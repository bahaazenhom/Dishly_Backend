import Joi from "joi";

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

export const checkoutSchema = {
  body: Joi.object({
    paymentMethod: Joi.string().valid("cash", "card", "online").default("cash"),
    customerFullName: Joi.string().trim().min(2).max(100).required(),
    customerEmail: Joi.string().email().trim().lowercase().required(),
    deliveryAddress: Joi.string().trim().min(10).max(500).required(),
    phoneNumber: Joi.string().trim().pattern(/^[0-9+\-\s()]+$/).min(10).max(20).required(),
  }),
};

export const confirmSchema = {
  body: Joi.object({
    orderId: objectId.required(),
  }),
};

export const cancelSchema = {
  body: Joi.object({
    orderId: objectId.required(),
  }),
};

export const getOrderSchema = {
  params: Joi.object({ 
    orderId: objectId.required() 
  }),
};