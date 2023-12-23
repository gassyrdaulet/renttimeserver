import { Router } from "express";
import { CheckToken } from "../middleware/CheckToken.js";
import { CheckOrganization } from "../middleware/CheckOrganization.js";
import {
  createNewKZClient,
  searchForKZClient,
  getClientByIdKZ,
} from "../controllers/ClientController.js";
import Joi from "joi";
import moment from "moment";

const router = new Router();

const namePattern = /^[a-zA-Zа-яА-Я0-9_\-+.()* ]+$/;
const addressPattern = /^[a-zA-Zа-яА-Я0-9\s,.'-]+$/;
const numericPattern = /^\d+$/;
const textPattern = /^[a-zA-Zа-яА-Я0-9\s,.'-]+$/;

const isCISPhoneNumber = (value) => {
  // Регулярное выражение для проверки формата номера телефона Казахстана
  const CISPhoneRegex =
    /^((8|\+374|\+994|\+995|\+375|\+7|\+380|\+38|\+996|\+998|\+993)[\- ]?)?\(?\d{3,5}\)?[\- ]?\d{1}[\- ]?\d{1}[\- ]?\d{1}[\- ]?\d{1}[\- ]?\d{1}(([\- ]?\d{1})?[\- ]?\d{1})?$/;
  return CISPhoneRegex.test(value);
};

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
  paper_authority: Joi.string().valid("mvdrk").required(),
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
  paper_givendate: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "undefined"),
  address: Joi.string().pattern(addressPattern).max(200).required(),
  email: Joi.string().email().max(50),
  city: Joi.string().max(20).pattern(addressPattern).required(),
  nationality: Joi.string().max(20).pattern(textPattern).required(),
  born_region: Joi.string().max(30).pattern(addressPattern).required(),
});
const validateNewKZClient = (req, res, next) => {
  const validationResult = kzClientSchema.validate(req.body);
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
  const searchSchema = Joi.object({
    searchText: Joi.string().pattern(namePattern).max(20).required(),
  });
  const validationResult = searchSchema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateIdParam = (req, res, next) => {
  req.query.client_id = parseInt(req.query?.client_id);
  const idParamSchema = Joi.object({
    client_id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = idParamSchema.validate(req.query);
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

export default router;
