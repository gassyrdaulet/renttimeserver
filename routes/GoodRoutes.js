import { Router } from "express";
import {
  createNewGood,
  getAllGoods,
  getAllGroups,
  getSpecies,
  createNewSpecie,
  getGoodDetails,
  createNewGroup,
  deleteGroup,
  editGroup,
  deleteGood,
  deleteSpecie,
  editGood,
  deleteImage,
  editSpecie,
  getAllSpecies,
  searchSpecie,
  getSpeciesXLSX,
} from "../controllers/GoodController.js";
import multer from "multer";
import { CheckToken } from "../middleware/CheckToken.js";
import { CheckOrganization } from "../middleware/CheckOrganization.js";
import Joi from "joi";
import {
  namePattern,
  parseObjectInt,
  textPattern,
  trimObject,
} from "./Patterns.js";

const image_limits = {
  createNewGood: 1.1,
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
  limits: { fieldSize: image_limits["createNewGood"] * 1024 * 1024 },
});
const validateProduct = (req, res, next) => {
  parseObjectInt(
    [
      "group_id",
      "price_per_minute",
      "price_per_hour",
      "price_per_day",
      "price_per_month",
      "compensation_price",
    ],
    req.body
  );
  const productSchema = Joi.object({
    image: Joi.allow(null),
    name: Joi.string().max(50).required().pattern(namePattern),
    group_id: Joi.number().integer().max(9999999999).min(-1).required(),
    price_per_minute: Joi.number().integer().max(9999999999).min(0),
    price_per_hour: Joi.number().integer().max(9999999999).min(0),
    price_per_day: Joi.number().integer().max(9999999999).min(0),
    price_per_month: Joi.number().integer().max(9999999999).min(0),
    compensation_price: Joi.number()
      .integer()
      .max(9999999999)
      .min(0)
      .required(),
  });
  const validationResult = productSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateEditGood = (req, res, next) => {
  parseObjectInt(
    [
      "group_id",
      "price_per_minute",
      "price_per_hour",
      "price_per_day",
      "price_per_month",
      "compensation_price",
    ],
    req.body
  );
  const schema = Joi.object({
    image: Joi.allow(null),
    name: Joi.string().max(50).pattern(namePattern),
    group_id: Joi.number().integer().max(9999999999).min(-1),
    price_per_minute: Joi.number().integer().max(9999999999).min(0),
    price_per_hour: Joi.number().integer().max(9999999999).min(0),
    price_per_day: Joi.number().integer().max(9999999999).min(0),
    price_per_month: Joi.number().integer().max(9999999999).min(0),
    compensation_price: Joi.number().integer().max(9999999999).min(0),
    good_id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = schema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateNewGroup = (req, res, next) => {
  const groupSchema = Joi.object({
    name: Joi.string().max(50).required().pattern(namePattern),
  });
  const validationResult = groupSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateEditGroup = (req, res, next) => {
  parseObjectInt(["good_id"], req.body);
  req.body.group_id = parseInt(req.body?.group_id);
  const groupSchema = Joi.object({
    group_id: Joi.number().integer().max(9999999999).min(0).required(),
    name: Joi.string().max(50).required().pattern(namePattern),
  });
  const validationResult = groupSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateSpecie = (req, res, next) => {
  parseObjectInt(["good_id"], req.body);
  const productSchema = Joi.object({
    status: Joi.string().valid(
      "available",
      "broken",
      "repairing",
      "missing",
      "busy"
    ),
    good_id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = productSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateEditSpecie = (req, res, next) => {
  parseObjectInt(["specie_id"], req.body);
  const productSchema = Joi.object({
    status: Joi.string().valid("available", "broken", "repairing", "missing"),
    specie_id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = productSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateIdParam = (req, res, next) => {
  parseObjectInt(["good_id"], req.query);
  const idParamSchema = Joi.object({
    good_id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = idParamSchema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateGoodIdParam = (req, res, next) => {
  parseObjectInt(["good_id"], req.query);
  const schema = Joi.object({
    good_id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = schema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateSpecieIdParam = (req, res, next) => {
  parseObjectInt(["specie_id"], req.query);
  const schema = Joi.object({
    specie_id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = schema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateIdBody = (req, res, next) => {
  parseObjectInt("id", req.bopdy);
  const idSchema = Joi.object({
    id: Joi.number().integer().max(9999999999).min(0).required(),
  });
  const validationResult = idSchema.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};
const validateSelectParams = (req, res, next) => {
  trimObject(["filter"], req.query);
  parseObjectInt(["page", "pageSize", "group_id"], req.query);
  const selectParamsSchema = Joi.object({
    page: Joi.number().integer().max(9999999999).min(0).required(),
    pageSize: Joi.number().integer().max(100).min(0).required(),
    sortBy: Joi.string().valid("name", "id").required(),
    sortOrder: Joi.string().valid("DESC", "ASC").required(),
    group_id: Joi.number().integer().max(9999999999).min(-2).required(),
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
const validateGetAllSpecies = (req, res, next) => {
  trimObject(["filter"], req.query);
  parseObjectInt(["page", "pageSize"], req.query);
  const selectParamsSchema = Joi.object({
    page: Joi.number().integer().max(9999999999).min(0).required(),
    pageSize: Joi.number().integer().max(100).min(0).required(),
    sortBy: Joi.string().valid("id", "good", "status").required(),
    sortOrder: Joi.string().valid("DESC", "ASC").required(),
    filter: Joi.string().max(50).pattern(namePattern),
    status: Joi.string().valid(
      "available",
      "missing",
      "repairing",
      "broken",
      "busy"
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
const validateSearchSpecie = (req, res, next) => {
  trimObject(["filter"], req.query);
  const schema = Joi.object({
    filter: Joi.string().pattern(textPattern).max(20).required(),
  });
  const validationResult = schema.validate(req.query);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }
  next();
};

const router = new Router();

router.post(
  "/new",
  CheckToken,
  CheckOrganization,
  upload.single("image"),
  validateProduct,
  createNewGood
);
router.post(
  "/edit",
  CheckToken,
  CheckOrganization,
  upload.single("image"),
  validateEditGood,
  editGood
);
router.post(
  "/newgroup",
  CheckToken,
  CheckOrganization,
  validateNewGroup,
  createNewGroup
);
router.post(
  "/editgroup",
  CheckToken,
  CheckOrganization,
  validateEditGroup,
  editGroup
);
router.post(
  "/deletegroup",
  CheckToken,
  CheckOrganization,
  validateIdBody,
  deleteGroup
);
router.post(
  "/newspecie",
  CheckToken,
  CheckOrganization,
  validateSpecie,
  createNewSpecie
);
router.post(
  "/editspecie",
  CheckToken,
  CheckOrganization,
  validateEditSpecie,
  editSpecie
);
router.get(
  "/all",
  CheckToken,
  CheckOrganization,
  validateSelectParams,
  getAllGoods
);
router.get(
  "/getallspecies",
  CheckToken,
  CheckOrganization,
  validateGetAllSpecies,
  getAllSpecies
);
router.get(
  "/species",
  CheckToken,
  CheckOrganization,
  validateIdParam,
  getSpecies
);
router.get(
  "/details",
  CheckToken,
  CheckOrganization,
  validateIdParam,
  getGoodDetails
);
router.delete(
  "/deletegood",
  CheckToken,
  CheckOrganization,
  validateGoodIdParam,
  deleteGood
);
router.delete(
  "/deletespecie",
  CheckToken,
  CheckOrganization,
  validateSpecieIdParam,
  deleteSpecie
);
router.delete(
  "/deleteimage",
  CheckToken,
  CheckOrganization,
  validateGoodIdParam,
  deleteImage
);
router.get(
  "/searchspecie",
  CheckToken,
  CheckOrganization,
  validateSearchSpecie,
  searchSpecie
);
router.get("/allgroups", CheckToken, CheckOrganization, getAllGroups);
router.get("/getspeciesxlsx", CheckToken, CheckOrganization, getSpeciesXLSX);

export default router;
