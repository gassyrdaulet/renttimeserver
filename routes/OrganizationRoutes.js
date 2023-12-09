import { Router } from "express";
import { newOrganization } from "../controllers/OrganizationController.js";
import { CheckToken } from "../middleware/CheckToken.js";
import Joi from "joi";
import moment from "moment";

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

const router = new Router();

router.post(
  "/neworg",
  CheckToken,
  validateNewOrganization,
  checkWorkTime,
  newOrganization
);

export default router;
