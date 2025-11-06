import Joi from "joi";

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

export const addItemSchema = {
  body: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          menuItemId: objectId.required(),
          quantity: Joi.number().integer().min(1).default(1),
        })
      )
      .min(1)
      .required(),
  }),
};


export const updateItemSchema = {
  body: Joi.object({
    menuItemId: objectId.required(),
    quantity: Joi.number().integer().min(1).required(),
  }),
};

export const removeItemSchema = {
  body: Joi.object({
    menuItemId: objectId.required(),
  }),
};

