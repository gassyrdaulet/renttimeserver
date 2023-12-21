import { Router } from "express";
import { CheckToken } from "../middleware/CheckToken.js";
import { CheckOrganization } from "../middleware/CheckOrganization.js";
import {
  createNewOrder,
  getOrderDetails,
  getOrders,
  newPayment,
  newExtension,
  newDelivery,
  finishOrder,
  newDiscount,
  cancelOrder,
  newPaymentForCourier,
} from "../controllers/OrderController.js";
import Joi from "joi";

const addressPattern = /^[a-zA-Zа-яА-Я0-9\s,.'-]+$/;
const namePattern = /^[a-zA-Zа-яА-Я0-9_\-+.()* ]+$/;

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
    .max(9999999999)
    .min(0)
    .required(),
  delivery_price_for_deliver: Joi.number()
    .integer()
    .max(9999999999)
    .min(0)
    .required(),
  comment: Joi.string().pattern(addressPattern).max(50),
});
const orderDeliverySchema2 = Joi.object({
  order_id: Joi.number().integer().max(9999999999).min(0).required(),
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
    .max(9999999999)
    .min(0)
    .required(),
  delivery_price_for_deliver: Joi.number()
    .integer()
    .max(9999999999)
    .min(0)
    .required(),
  comment: Joi.string().pattern(addressPattern).max(50),
  direction: Joi.string().valid("here", "there").required(),
});
const finishOrderSchema = Joi.object({
  order_id: Joi.number().integer().min(0).max(9999999999).required(),
  is_debt: Joi.boolean().required(),
});
const cancelOrderSchema = Joi.object({
  order_id: Joi.number().integer().min(0).max(9999999999).required(),
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
const validateSelectParams = (req, res, next) => {
  const intKeys = ["page", "pageSize"];
  for (let key of intKeys) {
    req.query[key] = parseInt(req.query[key]);
  }
  req.query.archive = req.query.archive === "true";
  const selectParamsSchema = Joi.object({
    page: Joi.number().integer().max(9999999999).min(0).required(),
    pageSize: Joi.number().integer().max(100).min(0).required(),
    sortBy: Joi.string()
      .valid("id", "created_date", "finished_date", "started_date")
      .required(),
    sortOrder: Joi.string().valid("DESC", "ASC").required(),
    archive: Joi.boolean().required(),
    filter: Joi.string().max(50).pattern(namePattern),
    firstDate: Joi.date(),
    secondDate: Joi.date(),
    dateType: Joi.string().valid(
      "created_date",
      "finished_date",
      "started_date"
    ),
  });
  const validationResult = selectParamsSchema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateIdParam = (req, res, next) => {
  req.query.order_id = parseInt(req.query?.order_id);
  const idParamSchema = Joi.object({
    order_id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = idParamSchema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validatePayment = (req, res, next) => {
  const intKeys = ["order_id", "amount", "payment_method_id"];
  for (let key of intKeys) {
    req.body[key] = parseInt(req.body[key]);
  }
  const paymentSchema = Joi.object({
    order_id: Joi.number().integer().max(9999999999).min(0).required(),
    amount: Joi.number().integer().max(9999999999).min(1).required(),
    date: Joi.date(),
    is_debt: Joi.boolean().required(),
    payment_method_id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = paymentSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validatePaymentForCourier = (req, res, next) => {
  const intKeys = ["order_id", "delivery_id", "amount", "payment_method_id"];
  for (let key of intKeys) {
    req.body[key] = parseInt(req.body[key]);
  }
  const paymentSchema = Joi.object({
    order_id: Joi.number().integer().max(9999999999).min(0).required(),
    delivery_id: Joi.number().integer().max(9999999999).min(0).required(),
    amount: Joi.number().integer().max(9999999999).min(1).required(),
    payment_method_id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = paymentSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateExtension = (req, res, next) => {
  const intKeys = ["order_id", "renttime"];
  for (let key of intKeys) {
    req.body[key] = parseInt(req.body[key]);
  }
  const extensionSchema = Joi.object({
    date: Joi.date(),
    order_id: Joi.number().integer().max(9999999999).min(0).required(),
    renttime: Joi.number().integer().max(9999999999).min(1).required(),
  });
  const validationResult = extensionSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateDiscount = (req, res, next) => {
  const intKeys = ["order_id", "amount"];
  for (let key of intKeys) {
    req.body[key] = parseInt(req.body[key]);
  }
  const extensionSchema = Joi.object({
    date: Joi.date(),
    order_id: Joi.number().integer().max(9999999999).min(0).required(),
    amount: Joi.number().integer().max(9999999999).min(1).required(),
    reason: Joi.string().pattern(addressPattern).max(150),
  });
  const validationResult = extensionSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateDelivery = (req, res, next) => {
  const intKeys = [
    "order_id",
    "delivery_price_for_customer",
    "delivery_price_for_deliver",
  ];
  for (let key of intKeys) {
    req.body[key] = parseInt(req.body[key]);
  }
  const validationResult = orderDeliverySchema2.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateFinishOrder = (req, res, next) => {
  const intKeys = ["order_id"];
  for (let key of intKeys) {
    req.body[key] = parseInt(req.body[key]);
  }
  const validationResult = finishOrderSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateCancelOrder = (req, res, next) => {
  const intKeys = ["order_id"];
  for (let key of intKeys) {
    req.body[key] = parseInt(req.body[key]);
  }
  const validationResult = cancelOrderSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
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
router.post(
  "/newpayment",
  CheckToken,
  CheckOrganization,
  validatePayment,
  newPayment
);
router.post(
  "/newpaymentcourier",
  CheckToken,
  CheckOrganization,
  validatePaymentForCourier,
  newPaymentForCourier
);
router.post(
  "/newextension",
  CheckToken,
  CheckOrganization,
  validateExtension,
  newExtension
);
router.post(
  "/newdiscount",
  CheckToken,
  CheckOrganization,
  validateDiscount,
  newDiscount
);
router.post(
  "/newdelivery",
  CheckToken,
  CheckOrganization,
  validateDelivery,
  newDelivery
);
router.post(
  "/finishorder",
  CheckToken,
  CheckOrganization,
  validateFinishOrder,
  finishOrder
);
router.post(
  "/cancelorder",
  CheckToken,
  CheckOrganization,
  validateCancelOrder,
  cancelOrder
);
router.get(
  "/all",
  CheckToken,
  CheckOrganization,
  validateSelectParams,
  getOrders
);
router.get(
  "/details",
  CheckToken,
  CheckOrganization,
  validateIdParam,
  getOrderDetails
);

export default router;
