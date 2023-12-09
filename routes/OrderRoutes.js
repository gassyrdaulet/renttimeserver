import { Router } from "express";
import { CheckToken } from "../middleware/CheckToken.js";
import { CheckOrganization } from "../middleware/CheckOrganization.js";
import { createNewOrder } from "../controllers/OrderController.js";
import Joi from "joi";

const addressPattern = /^[a-zA-Zа-яА-Я0-9\s,.'-]+$/;

const isCISPhoneNumber = (value) => {
  // Регулярное выражение для проверки формата номера телефона Казахстана
  const CISPhoneRegex =
    /^((8|\+374|\+994|\+995|\+375|\+7|\+380|\+38|\+996|\+998|\+993)[\- ]?)?\(?\d{3,5}\)?[\- ]?\d{1}[\- ]?\d{1}[\- ]?\d{1}[\- ]?\d{1}[\- ]?\d{1}(([\- ]?\d{1})?[\- ]?\d{1})?$/;
  return CISPhoneRegex.test(value);
};

const orderDeliverySchema = Joi.object({
  address: Joi.string().pattern(addressPattern).max(500).required(),
  cellphone: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (!isCISPhoneNumber(value)) {
        return helpers.message("Invalid phone format");
      }
      return value;
    })
    .required(),
  delivery_price_for_customer: Joi.number()
    .integer()
    .positive()
    .max(9999999999)
    .min(0)
    .required(),
  delivery_price_for_deliver: Joi.number()
    .integer()
    .positive()
    .max(9999999999)
    .min(0)
    .required(),
  comment: Joi.string().pattern(addressPattern).max(50),
});
const orderGoodSchema = Joi.object({
  id: Joi.number().integer().positive().max(9999999999).required(),
});
const orderSchema = Joi.object({
  client: Joi.number().integer().positive().max(9999999999).required(),
  renttime: Joi.number().integer().positive().min(1).max(9999999999).required(),
  forgive_lateness_ms: Joi.number().integer().min(0).max(999999999999999),
  started_date: Joi.date().required(),
  comment: Joi.string().pattern(addressPattern).max(500),
  discount: Joi.number().integer().min(0).max(9999999999),
  discountReason: Joi.string().pattern(addressPattern).max(150),
  tariff: Joi.string()
    .valid("daily", "hourly", "minutely", "monthly")
    .required(),
  goods: Joi.array().unique().items(orderGoodSchema).required(),
  deliveryHere: orderDeliverySchema,
  deliveryThere: orderDeliverySchema,
});

const validateOrder = (req, res, next) => {
  const { error } = orderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const router = new Router();

router.post(
  "/neworder",
  CheckToken,
  CheckOrganization,
  validateOrder,
  createNewOrder
);

export default router;
