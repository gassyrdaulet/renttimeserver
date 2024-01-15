import { Router } from "express";
import {
  addNewUser,
  getPaymentMethods,
  getUsers,
  newOrganization,
  grantPrivilege,
  deleteUser,
  createNewMethod,
  deleteMethod,
  changeMethodOption,
  editMethod,
  getWorkshifts,
  newWorkshift,
  closeWorkshift,
  controlWorkshift,
  getWorkshift,
} from "../controllers/OrganizationController.js";
import { CheckToken } from "../middleware/CheckToken.js";
import Joi from "joi";
import moment from "moment";
import { CheckOrganization } from "../middleware/CheckOrganization.js";
import {
  addressPattern,
  numericPattern,
  textPattern,
  namePattern,
  parseObjectInt,
  trimObject,
} from "./Patterns.js";

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
    address: Joi.string().pattern(addressPattern).max(50).required(),
    city: Joi.string().max(20).pattern(addressPattern).required(),
    region: Joi.string().valid("kz"),
    start_work: Joi.string().required(),
    end_work: Joi.string().required(),
    bank_company_type: Joi.string().valid("АО", "ТОО", "ОАО", "ИП"),
    company_type: Joi.string().valid("АО", "ТОО", "ОАО", "ИП"),
    bank_company_name: Joi.string().pattern(textPattern).max(20).required(),
    company_name: Joi.string().pattern(textPattern).max(20).required(),
    kz_paper_bik: Joi.string().pattern(textPattern).max(12).required(),
    kz_paper_bin: Joi.string().max(12).pattern(numericPattern).required(),
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
const validateDeleteUser = (req, res, next) => {
  const schema = Joi.object({
    user_id: Joi.number().integer().min(0).max(9999999999).required(),
  });
  const validationResult = schema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateGrantPrivilege = (req, res, next) => {
  const schema = Joi.object({
    user_id: Joi.number().integer().min(0).max(9999999999).required(),
    privilege: Joi.string()
      .valid("admin", "courier", "manager", "debt")
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
const validateMethodOptionChange = (req, res, next) => {
  const schema = Joi.object({
    method_id: Joi.number().integer().min(0).max(9999999999).required(),
    option: Joi.string().valid("courier_access").required(),
  });
  const validationResult = schema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateMethodIdParam = (req, res, next) => {
  const schema = Joi.object({
    method_id: Joi.number().integer().min(0).max(9999999999).required(),
  });
  const validationResult = schema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateNewMethod = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(20).pattern(textPattern).required(),
    courier_access: Joi.boolean(),
    comission: Joi.number().precision(2).required(),
  });
  const validationResult = schema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateEditMethod = (req, res, next) => {
  const schema = Joi.object({
    method_id: Joi.number().integer().min(0).max(9999999999).required(),
    name: Joi.string().max(20).pattern(textPattern),
    comission: Joi.number().precision(2),
  });
  const validationResult = schema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateGetWorkshifts = (req, res, next) => {
  trimObject(["filter"], req.query);
  parseObjectInt(["page", "pageSize"], req.query);
  const schema = Joi.object({
    page: Joi.number().integer().max(9999999999).min(0).required(),
    pageSize: Joi.number().integer().max(100).min(0).required(),
    sortBy: Joi.string().valid("open_date", "id", "close_date").required(),
    sortOrder: Joi.string().valid("DESC", "ASC").required(),
    filter: Joi.string().max(50).pattern(namePattern),
    firstDate: Joi.date(),
    secondDate: Joi.date(),
    dateType: Joi.string().valid("open_date", "close_date"),
  });
  const validationResult = schema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateCloseWorkshift = (req, res, next) => {
  const schema = Joi.object({
    workshift_id: Joi.number().integer().min(0).max(9999999999).required(),
  });
  const validationResult = schema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateGetWorkshift = (req, res, next) => {
  const schema = Joi.object({
    workshift_id: Joi.number().integer().min(0).max(9999999999),
  });
  const validationResult = schema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateControlWorkshift = (req, res, next) => {
  parseObjectInt(["amount", "payment_method_id", "workshift_id"], req.body);
  const schema = Joi.object({
    positive: Joi.boolean().required(),
    amount: Joi.number().integer().max(9999999999).min(1).required(),
    payment_method_id: Joi.number().integer().max(9999999999).min(0).required(),
    workshift_id: Joi.number().integer().min(0).max(9999999999).required(),
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
router.delete(
  "/deleteuser",
  CheckToken,
  CheckOrganization,
  validateDeleteUser,
  deleteUser
);
router.post(
  "/grantprivilege",
  CheckToken,
  CheckOrganization,
  validateGrantPrivilege,
  grantPrivilege
);
router.post(
  "/changemethodoption",
  CheckToken,
  CheckOrganization,
  validateMethodOptionChange,
  changeMethodOption
);
router.post(
  "/editmethod",
  CheckToken,
  CheckOrganization,
  validateEditMethod,
  editMethod
);
router.delete(
  "/deletemethod",
  CheckToken,
  CheckOrganization,
  validateMethodIdParam,
  deleteMethod
);
router.post(
  "/createmethod",
  CheckToken,
  CheckOrganization,
  validateNewMethod,
  createNewMethod
);
router.get(
  "/getworkshifts",
  CheckToken,
  CheckOrganization,
  validateGetWorkshifts,
  getWorkshifts
);
router.post("/newworkshift", CheckToken, CheckOrganization, newWorkshift);
router.get(
  "/getworkshift",
  CheckToken,
  CheckOrganization,
  validateGetWorkshift,
  getWorkshift
);
router.post(
  "/closeworkshift",
  CheckToken,
  CheckOrganization,
  validateCloseWorkshift,
  closeWorkshift
);
router.post(
  "/controlworkshift",
  CheckToken,
  CheckOrganization,
  validateControlWorkshift,
  controlWorkshift
);

export default router;
