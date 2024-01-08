import { Router } from "express";
import {
  registration,
  ping,
  registrationGoogle,
} from "../controllers/AuthController.js";
import { CheckToken } from "../middleware/CheckToken.js";
import { CheckOrganization } from "../middleware/CheckOrganization.js";
import Joi from "joi";
import { namePattern, isCISPhoneNumber, trimObject } from "./Patterns.js";

const router = new Router();

function validateNewAccount(req, res, next) {
  trimObject(["second_name", "name", "father_name"], req.body);
  const schema = Joi.object({
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
    email: Joi.string().max(30).email().lowercase().required(),
    password: Joi.string()
      .min(8)
      .max(30)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
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

function newUserViaGoogle(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
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

router.post("/registration", validateNewAccount, registration);
router.post("/registrationgoogle", newUserViaGoogle, registrationGoogle);
router.get("/orgcheck", CheckToken, CheckOrganization, ping);
router.get("/authcheck", CheckToken, ping);

export default router;
