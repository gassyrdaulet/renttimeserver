import { Router } from "express";
import {
  getContract,
  sendCode,
  confirmCode,
} from "../controllers/PublicControllers.js";
import Joi from "joi";

const getContractSchema = Joi.object({
  organization_id: Joi.number().integer().positive().max(9999999999).required(),
  order_id: Joi.number().integer().positive().max(9999999999).required(),
  contract_code: Joi.string()
    .min(5)
    .max(8)
    .lowercase()
    .regex(/^[a-zA-Z]+$/)
    .required(),
});

const getContractSchemaCode = Joi.object({
  organization_id: Joi.number().integer().positive().max(9999999999).required(),
  order_id: Joi.number().integer().positive().max(9999999999).required(),
  contract_code: Joi.string()
    .min(5)
    .max(8)
    .lowercase()
    .regex(/^[a-zA-Z]+$/)
    .required(),
  sign_code: Joi.string()
    .min(6)
    .max(6)
    .regex(/^[0-9]+$/)
    .required(),
});

const validateParams = (req, res, next) => {
  const { error } = getContractSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateParamsConfirmCode = (req, res, next) => {
  const { error } = getContractSchemaCode.validate(req.query);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const router = new Router();

router.get("/getcontract", validateParams, getContract);
router.get("/sendcode", validateParams, sendCode);
router.get("/confirmcode", validateParamsConfirmCode, confirmCode);

export default router;
