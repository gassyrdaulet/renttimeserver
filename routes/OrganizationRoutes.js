import { Router } from "express";
import {
  addNewUser,
  getPaymentMethods,
  getUsers,
  newOrganization,
} from "../controllers/OrganizationController.js";
import { CheckToken } from "../middleware/CheckToken.js";
import Joi from "joi";
import moment from "moment";
import { CheckOrganization } from "../middleware/CheckOrganization.js";

const textPattern = /^[a-zA-Zа-яА-Я0-9\s,.'-]+$/;

const checkWorkTime = (req, res, next) => {
  const { start_work, end_work } = req.body;
  if (
    !moment(start_work, "HH:mm").isValid() ||
    !moment(end_work, "HH:mm").isValid()
  ) {
    return res.status(400).json({
      message: "Некорректный формат времени.",
    });
  }
  if (moment(start_work, "HH:mm").isSameOrAfter(moment(end_work, "HH:mm"))) {
    return res.status(400).json({
      message:
        "Неправильно выбрано время работы! (Время открытия должно быть раньше времени закрытия)",
    });
  }
  next();
};

function validateNewOrganization(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().pattern(textPattern).max(30).required(),
    address: Joi.string().pattern(textPattern).max(50).required(),
    city: Joi.string().max(20).pattern(textPattern).required(),
    region: Joi.string().valid("kz"),
    start_work: Joi.string().required(),
    end_work: Joi.string().required(),
    bank_company_type: Joi.string().valid("АО", "ТОО", "ОАО", "ИП"),
    company_type: Joi.string().valid("АО", "ТОО", "ОАО", "ИП"),
    bank_company_name: Joi.string().pattern(textPattern).max(20).required(),
    company_name: Joi.string().pattern(textPattern).max(20).required(),
    kz_paper_bik: Joi.string().pattern(textPattern).max(12).required(),
    kz_paper_bin: Joi.string().max(12).pattern(textPattern).required(),
    kz_paper_iik: Joi.string().max(20).pattern(textPattern).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    const errMessage = error?.details?.[0]?.message;
    return res
      .status(400)
      .json({ message: errMessage ? errMessage : "Data validation error" });
  }
  next();
}
const validateGetPaymentMethods = (req, res, next) => {
  req.query.courier_access = req.query.courier_access === "true";
  const getPaymentSchema = Joi.object({
    courier_access: Joi.boolean().required(),
  });
  const validationResult = getPaymentSchema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateGetUsers = (req, res, next) => {
  const getPaymentSchema = Joi.object({
    role: Joi.string().valid("manager", "courier", "admin"),
  });
  const validationResult = getPaymentSchema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateNewUser = (req, res, next) => {
  const rolesSchema = Joi.object({
    admin: Joi.boolean(),
    debt: Joi.boolean(),
    courier: Joi.boolean(),
    manager: Joi.boolean(),
  });
  const getPaymentSchema = Joi.object({
    user_id: Joi.number().integer().min(0).max(9999999999).required(),
    roles: rolesSchema,
  });
  const validationResult = getPaymentSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};

const router = new Router();

router.post(
  "/neworg",
  CheckToken,
  validateNewOrganization,
  checkWorkTime,
  newOrganization
);
router.get(
  "/methods",
  CheckToken,
  CheckOrganization,
  validateGetPaymentMethods,
  getPaymentMethods
);
router.get("/users", CheckToken, CheckOrganization, validateGetUsers, getUsers);
router.post(
  "/newuser",
  CheckToken,
  CheckOrganization,
  validateNewUser,
  addNewUser
);

export default router;
