import Joi from "joi";

export const checkoutSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        price: Joi.number().positive().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
});
