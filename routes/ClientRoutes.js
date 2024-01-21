import { Router } from "express";
import { CheckToken } from "../middleware/CheckToken.js";
import { CheckOrganization } from "../middleware/CheckOrganization.js";
import {
  createNewKZClient,
  searchForKZClient,
  getClientByIdKZ,
  getAllClients,
  editKZCLient,
  getDebts,
  newDebt,
  deleteClient,
  closeDebt,
} from "../controllers/ClientController.js";
import Joi from "joi";
import moment from "moment";
import {
  namePattern,
  addressPattern,
  numericPattern,
  textPattern,
  isCISPhoneNumber,
  parseObjectInt,
  trimObject,
} from "./Patterns.js";

const router = new Router();

const kzClientSchema = Joi.object({
  paper_person_id: Joi.string()
    .min(12)
    .max(12)
    .pattern(numericPattern)
    .required(),
  paper_serial_number: Joi.string()
    .min(8)
    .max(10)
    .pattern(numericPattern)
    .required(),
  paper_authority: Joi.string().valid("mvdrk", "undefined").required(),
  cellphone: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (!isCISPhoneNumber(value)) {
        return helpers.message("Invalid phone format");
      }
      return value;
    })
    .required(),
  second_name: Joi.string().pattern(namePattern).max(50).required(),
  name: Joi.string().max(50).pattern(namePattern).required(),
  father_name: Joi.string().max(50).pattern(namePattern),
  paper_givendate: Joi.string(),
  gender: Joi.string().valid("male", "female", "undefined").required(),
  address: Joi.string().pattern(addressPattern).max(200),
  email: Joi.string().email().max(50),
  city: Joi.string().max(20).pattern(addressPattern),
  nationality: Joi.string().max(20).pattern(namePattern),
  born_region: Joi.string().max(30).pattern(addressPattern),
});
const validateNewKZClient = (req, res, next) => {
  trimObject(["second_name", "name", "father_name"], req.body);
  const validationResult = kzClientSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateEditKZClient = (req, res, next) => {
  trimObject(["second_name", "name", "father_name"], req.body);
  const schema = Joi.object({
    paper_person_id: Joi.string()
      .min(12)
      .max(12)
      .pattern(numericPattern)
      .required(),
    paper_serial_number: Joi.string()
      .min(8)
      .max(10)
      .pattern(numericPattern)
      .required(),
    paper_authority: Joi.string().valid("mvdrk", "undefined").required(),
    cellphone: Joi.string()
      .trim()
      .custom((value, helpers) => {
        if (!isCISPhoneNumber(value)) {
          return helpers.message("Invalid phone format");
        }
        return value;
      })
      .required(),
    client_id: Joi.number().integer().max(9999999999).min(0).required(),
    second_name: Joi.string().pattern(namePattern).max(50).required(),
    name: Joi.string().max(50).pattern(namePattern).required(),
    father_name: Joi.string().max(50).pattern(namePattern),
    paper_givendate: Joi.string(),
    gender: Joi.string().valid("male", "female", "undefined").required(),
    address: Joi.string().pattern(addressPattern).max(200),
    email: Joi.string().email().max(50),
    city: Joi.string().max(20).pattern(addressPattern),
    nationality: Joi.string().max(20).pattern(namePattern),
    born_region: Joi.string().max(30).pattern(addressPattern),
  });
  const validationResult = schema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateDate = (req, res, next) => {
  const { paper_givendate } = req.body;
  if (!paper_givendate) {
    return next();
  }
  if (!moment(paper_givendate).isValid()) {
    return res.status(400).json({
      message: "Некорректный формат даты.",
    });
  }
  req.body.paper_givendate = new Date(
    parseInt(moment(req.body.paper_givendate).valueOf())
  );
  next();
};
const validateSearchText = (req, res, next) => {
  trimObject(["searchText"], req.query);
  const schema = Joi.object({
    searchText: Joi.string().pattern(textPattern).max(20).required(),
  });
  const validationResult = schema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateIdParam = (req, res, next) => {
  parseObjectInt(["client_id"], req.query);
  const schema = Joi.object({
    client_id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = schema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};

const validateCloseDebt = (req, res, next) => {
  parseObjectInt(["debt_id"], req.query);
  const schema = Joi.object({
    debt_id: Joi.number().integer().max(9999999999).min(0).required(),
    payment_method_id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = schema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};

const validateSelectParams = (req, res, next) => {
  parseObjectInt(["page", "pageSize"], req.query);
  const selectParamsSchema = Joi.object({
    page: Joi.number().integer().max(9999999999).min(0).required(),
    pageSize: Joi.number().integer().max(100).min(0).required(),
    sortBy: Joi.string().valid("create_date", "debts_sum", "second_name"),
    sortOrder: Joi.string().valid("DESC", "ASC"),
    filter: Joi.string().max(50).pattern(namePattern),
  });
  const validationResult = selectParamsSchema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};

const validateIINparam = (req, res, next) => {
  const schema = Joi.object({
    iin: Joi.string().min(12).max(12).pattern(numericPattern).required(),
  });
  const validationResult = schema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};

const validateDebt = (req, res, next) => {
  parseObjectInt(["client_id", "amount"], req.body);
  const schema = Joi.object({
    date: Joi.date(),
    client_id: Joi.number().integer().max(9999999999).min(0).required(),
    amount: Joi.number().integer().max(9999999999).min(-9999999999).required(),
    comment: Joi.string().pattern(textPattern).max(150),
  });
  const validationResult = schema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};

router.post(
  "/newclientkz",
  CheckToken,
  CheckOrganization,
  validateNewKZClient,
  validateDate,
  createNewKZClient
);
router.post(
  "/editclientkz",
  CheckToken,
  CheckOrganization,
  validateEditKZClient,
  validateDate,
  editKZCLient
);
router.get(
  "/searchclientkz",
  CheckToken,
  CheckOrganization,
  validateSearchText,
  searchForKZClient
);
router.get(
  "/getclientbyidkz",
  CheckToken,
  CheckOrganization,
  validateIdParam,
  getClientByIdKZ
);
router.delete(
  "/deleteclient",
  CheckToken,
  CheckOrganization,
  validateIdParam,
  deleteClient
);
router.get(
  "/all",
  CheckToken,
  CheckOrganization,
  validateSelectParams,
  getAllClients
);
router.get(
  "/getdebts",
  CheckToken,
  CheckOrganization,
  validateIINparam,
  getDebts
);
router.post("/newdebt", CheckToken, CheckOrganization, validateDebt, newDebt);
// router.post(
//   "/closedebt",
//   CheckToken,
//   CheckOrganization,
//   validateCloseDebt,
//   closeDebt
// );

export default router;
