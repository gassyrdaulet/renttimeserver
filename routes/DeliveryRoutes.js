import { Router } from "express";
import { CheckToken } from "../middleware/CheckToken.js";
import { CheckOrganization } from "../middleware/CheckOrganization.js";
import Joi from "joi";
import {
  issueDelivery,
  getDeliveries,
  getDeliveryDetails,
  refuseDelivery,
  sendCourier,
  finishDeliveries,
} from "../controllers/DeliveryController.js";

const namePattern = /^[a-zA-Zа-яА-Я0-9_\-+.()* ]+$/;
const addressPattern = /^[a-zA-Zа-яА-Я0-9\s,.'-]+$/;

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
      .valid(
        "id",
        "created_date",
        "went_date",
        "delivered_date",
        "finished_date"
      )
      .required(),
    sortOrder: Joi.string().valid("DESC", "ASC").required(),
    archive: Joi.boolean().required(),
    filter: Joi.string().max(50).pattern(namePattern),
    firstDate: Joi.date(),
    secondDate: Joi.date(),
    dateType: Joi.string().valid(
      "created_date",
      "went_date",
      "delivered_date",
      "finished_date"
    ),
    courier_id: Joi.number().integer().min(0).max(9999999999),
    status: Joi.string()
      .valid("new", "wfd", "processing", "archive")
      .required(),
  });
  const validationResult = selectParamsSchema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateSendCourier = (req, res, next) => {
  const deliveriesItemSchema = Joi.object({
    delivery_id: Joi.number().integer().min(0).max(9999999999).required(),
  });
  const sendCourierSchema = Joi.object({
    courier_id: Joi.number().integer().max(9999999999).min(0).required(),
    deliveries: Joi.array().unique().items(deliveriesItemSchema).required(),
  });
  const validationResult = sendCourierSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateDeliveryId = (req, res, next) => {
  req.query.delivery_id = parseInt(req.query?.delivery_id);
  const idParamSchema = Joi.object({
    delivery_id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = idParamSchema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateFinish = (req, res, next) => {
  const deliveriesItemSchema = Joi.object({
    delivery_id: Joi.number().integer().min(0).max(9999999999).required(),
    delivery_price_for_deliver: Joi.number()
      .integer()
      .min(0)
      .max(9999999999)
      .required(),
  });
  const finishSchema = Joi.object({
    comment: Joi.string().pattern(addressPattern).max(200),
    deliveries: Joi.array().unique().items(deliveriesItemSchema).required(),
  });
  const validationResult = finishSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};

const router = new Router();

router.get(
  "/all",
  CheckToken,
  CheckOrganization,
  validateSelectParams,
  getDeliveries
);
router.get(
  "/details",
  CheckToken,
  CheckOrganization,
  validateDeliveryId,
  getDeliveryDetails
);
router.post(
  "/send",
  CheckToken,
  CheckOrganization,
  validateSendCourier,
  sendCourier
);
router.post(
  "/issue",
  CheckToken,
  CheckOrganization,
  validateDeliveryId,
  issueDelivery
);
router.post(
  "/refuse",
  CheckToken,
  CheckOrganization,
  validateDeliveryId,
  refuseDelivery
);
router.post(
  "/finish",
  CheckToken,
  CheckOrganization,
  validateFinish,
  finishDeliveries
);
export default router;
