import { Router } from "express";
import { CheckToken } from "../middleware/CheckToken.js";
import { CheckOrganization } from "../middleware/CheckOrganization.js";
import {
  createNewOrder,
  getOrderDetails,
  getOrders,
  newPayment,
  newExtension,
  finishOrder,
  newDiscount,
  cancelOrder,
  newPaymentForCourier,
  signPhysical,
  sendLink,
  deleteExtension,
  deletePayment,
  deleteDiscount,
} from "../controllers/OrderController.js";
import Joi from "joi";
import {
  addressPattern,
  namePattern,
  isCISPhoneNumber,
  parseObjectInt,
} from "./Patterns.js";

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
  sendSMS: Joi.boolean().required(),
});

const validateOrder = (req, res, next) => {
  const { error } = orderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
const validateSelectParams = (req, res, next) => {
  parseObjectInt(["page", "pageSize"], req.query);
  req.query.archive = req.query.archive === "true";
  const selectParamsSchema = Joi.object({
    page: Joi.number().integer().max(9999999999).min(0).required(),
    pageSize: Joi.number().integer().max(100).min(0).required(),
    sortBy: Joi.string()
      .valid(
        "id",
        "created_date",
        "finished_date",
        "started_date",
        "planned_date"
      )
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
  parseObjectInt(["order_id"], req.query);
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
const validateDeleteByIdParam = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = schema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validatePayment = (req, res, next) => {
  parseObjectInt(["order_id", "amount", "payment_method_id"], req.body);
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
  parseObjectInt(
    ["order_id", "delivery_id", "amount", "payment_method_id"],
    req.body
  );
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
  parseObjectInt(["order_id", "renttime"], req.body);
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
  parseObjectInt(["order_id", "amount"], req.body);
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
const validateFinishOrder = (req, res, next) => {
  parseObjectInt(["order_id"], req.body);
  const validationResult = finishOrderSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateCancelOrder = (req, res, next) => {
  parseObjectInt(["order_id"], req.body);
  const validationResult = cancelOrderSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};

const validateSendLink = (req, res, next) => {
  const schema = Joi.object({
    order_id: Joi.number().integer().positive().max(9999999999).required(),
    link_code: Joi.string()
      .min(5)
      .max(8)
      .lowercase()
      .regex(/^[a-zA-Z]+$/)
      .required(),
  });
  const validationResult = schema.validate(req.body);
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
  "/sendlink",
  CheckToken,
  CheckOrganization,
  validateSendLink,
  sendLink
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
router.post(
  "/signphysical",
  CheckToken,
  CheckOrganization,
  validateIdParam,
  signPhysical
);
router.delete(
  "/deleteextension",
  CheckToken,
  CheckOrganization,
  validateDeleteByIdParam,
  deleteExtension
);
router.delete(
  "/deletepayment",
  CheckToken,
  CheckOrganization,
  validateDeleteByIdParam,
  deletePayment
);
router.delete(
  "/deletediscount",
  CheckToken,
  CheckOrganization,
  validateDeleteByIdParam,
  deleteDiscount
);

export default router;
