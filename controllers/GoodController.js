import { createDynamicModel } from "../db/db.js";
import { Op, where } from "sequelize";
import {
  getImageResolution,
  createThumbnailFromBuffer,
  saveFromBuffer,
  deleteImagesByProductID,
} from "../service/ImageServise.js";
import { customAlphabet } from "nanoid";

export const getAllGoods = async (req, res) => {
  try {
    const { organization } = req.user;
    const { page, pageSize, sortBy, sortOrder, filter, group_id } = req.query;
    const finalFilter = filter ? filter : "";
    const whereCondition = {
      [Op.or]: [
        { name: { [Op.like]: `%${finalFilter}%` } },
        { id: { [Op.like]: `%${finalFilter}%` } },
      ],
      [Op.and]: [group_id === -2 ? {} : { group_id }],
    };
    const orderOptions = [[sortBy, sortOrder]];
    const Good = createDynamicModel("Good", organization);
    const Specie = createDynamicModel("Specie", organization);
    const totalCount = await Good.count();
    Good.hasMany(Specie, { foreignKey: "good", as: "species" });
    const result = await Good.findAndCountAll({
      where: whereCondition,
      order: orderOptions,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          model: Specie,
          as: "species",
          attributes: ["code", "status"],
          required: false,
        },
      ],
      group: `Good_${organization}.id`,
    });
    res.status(200).json({
      goods: result.rows,
      totalCount,
      filteredTotalCount: result.count.length,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const searchSpecie = async (req, res) => {
  try {
    const { organization } = req.user;
    const { filter } = req.query;
    const everyWord = filter.split(" ");
    const everyWordFiltered = everyWord.filter((i) => i !== "");
    const filterOptions = everyWordFiltered.map((item) => ({
      [Op.like]: `%${item}%`,
    }));
    const Specie = createDynamicModel("Specie", organization);
    const Good = createDynamicModel("Good", organization);
    Specie.belongsTo(Good, { foreignKey: "good", as: "goodInfo" });
    const result = await Specie.findAll({
      limit: 50,
      include: [
        {
          model: Good,
          as: "goodInfo",
          required: true,
        },
      ],
      where: {
        [Op.or]: [
          {
            id: { [Op.or]: filterOptions },
          },
          {
            code: { [Op.or]: filterOptions },
          },
          {
            order: { [Op.or]: filterOptions },
          },
        ],
      },
    });
    res.send(result);
  } catch (e) {
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getAllSpecies = async (req, res) => {
  try {
    const { organization } = req.user;
    const { page, pageSize, sortBy, sortOrder, filter, status } = req.query;
    const whereCondition = {};
    if (filter) {
      whereCondition[Op.or] = [
        { code: { [Op.like]: `%${filter}%` } },
        { id: { [Op.like]: `%${filter}%` } },
      ];
    }
    if (status) {
      whereCondition[Op.and] = { status };
    }
    const orderOptions = [[sortBy, sortOrder]];
    const Good = createDynamicModel("Good", organization);
    const Specie = createDynamicModel("Specie", organization);
    Specie.belongsTo(Good, { foreignKey: "good", as: "goodInfo" });
    const totalCount = await Specie.count();
    const result = await Specie.findAndCountAll({
      where: whereCondition,
      order: orderOptions,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          model: Good,
          as: "goodInfo",
          attributes: ["id", "name"],
          required: true,
        },
      ],
      group: `Specie_${organization}.id`,
    });
    res.status(200).json({
      species: result.rows,
      totalCount,
      filteredTotalCount: result.count.length,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getGoodDetails = async (req, res) => {
  try {
    const { organization } = req.user;
    const { good_id } = req.query;
    const Good = createDynamicModel("Good", organization);
    const Group = createDynamicModel("Group", organization);
    Good.belongsTo(Group, { foreignKey: "group_id", as: "groupInfo" });
    const good = await Good.findOne({
      where: { id: good_id },
      include: [{ model: Group, as: "groupInfo", required: false }],
    });
    return res.send(good);
  } catch (e) {
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getSpecies = async (req, res) => {
  try {
    const { organization } = req.user;
    const { good_id } = req.query;
    const Specie = createDynamicModel("Specie", organization);
    const orderOptions = [
      ["status", "ASC"],
      ["id", "ASC"],
    ];
    const species = await Specie.findAll({
      where: { good: good_id },
      order: orderOptions,
    });
    return res.send(species);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const deleteGood = async (req, res) => {
  try {
    const { organization } = req.user;
    const { good_id } = req.query;
    const Good = createDynamicModel("Good", organization);
    const Specie = createDynamicModel("Specie", organization);
    Good.hasMany(Specie, { foreignKey: "good", as: "species" });
    const goodInfo = await Good.findOne({
      where: { id: good_id },
      include: [
        { model: Specie, required: false, attributes: ["id"], as: "species" },
      ],
    });
    if (!goodInfo) {
      return res.status(400).json({ message: "Good not found" });
    }
    const goodInfoPlain = goodInfo.get({ plain: true });
    if (goodInfoPlain.species?.length > 0) {
      return res
        .status(400)
        .json({ message: "Can not delete good with species" });
    }
    await Good.destroy({ where: { id: good_id } });
    res.status(200).json({ message: "Good deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const deleteSpecie = async (req, res) => {
  try {
    const { organization } = req.user;
    const { specie_id } = req.query;
    const Specie = createDynamicModel("Specie", organization);
    const specieInfo = await Specie.findOne({ where: { id: specie_id } });
    if (!specieInfo) {
      return res.status(400).json({ message: "Specie not found" });
    }
    const specieInfoPlain = specieInfo.get({ plain: true });
    if (specieInfoPlain.status === "busy" || specieInfoPlain.order) {
      return res.status(400).json({ message: "Specie is busy" });
    }
    await Specie.destroy({ where: { id: specie_id } });
    res.status(200).json({ message: "Specie deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const { organization } = req.user;
    const Group = createDynamicModel("Group", organization);
    const orderOptions = [["name", "ASC"]];
    const groups = await Group.findAll({
      order: orderOptions,
    });
    return res.send(groups);
  } catch (e) {
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const createNewGood = async (req, res) => {
  try {
    const minWidth = 256;
    const minHeight = 256;
    const { organization } = req.user;
    const {
      name,
      image,
      group_id,
      price_per_minute,
      price_per_hour,
      price_per_day,
      price_per_month,
      compensation_price,
    } = req.body;
    const Good = createDynamicModel("Good", organization);
    const insertInfo = (
      await Good.create({
        name,
        photo: null,
        group_id,
        price_per_minute,
        price_per_hour,
        price_per_day,
        price_per_month,
        compensation_price,
      })
    ).get({ plain: true });
    const randomName = customAlphabet(
      "1234567890abcdefghijklmnopqrstuvwxyz",
      7
    )();
    try {
      if (image && image !== null && image !== "null") {
        const imageData = image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(imageData, "base64");
        const resolutions = getImageResolution(imageBuffer);
        if (resolutions.width < minWidth || resolutions.height < minHeight) {
          throw new Error(
            `Image resolutions are too small: minWidth = ${minWidth}, minHeight = ${minHeight}`
          );
        }
        await createThumbnailFromBuffer(
          imageBuffer,
          `small_${randomName}${insertInfo.id}`,
          100,
          organization
        );
        await createThumbnailFromBuffer(
          imageBuffer,
          `medium_${randomName}${insertInfo.id}`,
          256,
          organization
        );
        await saveFromBuffer(
          imageBuffer,
          `original_${randomName}${insertInfo.id}`,
          organization
        );
        await Good.update(
          { photo: randomName },
          { where: { id: insertInfo.id } }
        );
      }
    } catch (e) {
      await Good.destroy({ where: { id: insertInfo.id } });
      await deleteImagesByProductID(randomName + insertInfo.id, organization);
      const message = e?.message ? e.message : "Image upload error";
      return res.status(500).json({ message });
    }
    return res.status(200).json({ message: "New good created successfully" });
  } catch (e) {
    if (e?.original?.errno === 1062) {
      return res.status(400).json({ message: `Duplicate entry` });
    }
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const editGood = async (req, res) => {
  try {
    const minWidth = 256;
    const minHeight = 256;
    const { organization } = req.user;
    const { image, good_id } = req.body;
    delete req.body.image;
    delete req.body.good_id;
    const Good = createDynamicModel("Good", organization);
    const goodInfo = await Good.findOne({ where: { id: good_id } });
    if (!goodInfo) {
      return res.status(400).json({ message: "Good not found" });
    }
    const goodInfoPlain = goodInfo.get({ plain: true });
    await Good.update(
      {
        ...req.body,
      },
      { where: { id: good_id } }
    );
    const randomName = customAlphabet(
      "1234567890abcdefghijklmnopqrstuvwxyz",
      7
    )();
    try {
      if (image && image !== null && image !== "null") {
        await deleteImagesByProductID(
          goodInfoPlain.photo + goodInfoPlain.id,
          organization
        );
        const imageData = image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(imageData, "base64");
        const resolutions = getImageResolution(imageBuffer);
        if (resolutions.width < minWidth || resolutions.height < minHeight) {
          throw new Error(
            `Image resolutions are too small: minWidth = ${minWidth}, minHeight = ${minHeight}`
          );
        }
        await createThumbnailFromBuffer(
          imageBuffer,
          `small_${randomName}${good_id}`,
          100,
          organization
        );
        await createThumbnailFromBuffer(
          imageBuffer,
          `medium_${randomName}${good_id}`,
          256,
          organization
        );
        await saveFromBuffer(
          imageBuffer,
          `original_${randomName}${good_id}`,
          organization
        );
        await Good.update({ photo: randomName }, { where: { id: good_id } });
      }
    } catch (e) {
      const message = e?.message ? e.message : "Image upload error";
      return res.status(400).json({ message });
    }
    return res.status(200).json({ message: "Good edited successfully" });
  } catch (e) {
    if (e?.original?.errno === 1062) {
      return res.status(400).json({ message: `Duplicate entry` });
    }
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { organization } = req.user;
    const { good_id } = req.query;
    const Good = createDynamicModel("Good", organization);
    const goodInfo = await Good.findOne({ where: { id: good_id } });
    if (!goodInfo) {
      return res.status(400).json({ message: "Good not found" });
    }
    const goodInfoPlain = goodInfo.get({ plain: true });
    await Good.update(
      {
        photo: null,
      },
      { where: { id: good_id } }
    );
    await deleteImagesByProductID(
      goodInfoPlain.photo + goodInfoPlain.id,
      organization
    );
    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (e) {
    if (e?.original?.errno === 1062) {
      return res.status(400).json({ message: `Duplicate entry` });
    }
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const createNewGroup = async (req, res) => {
  try {
    const { organization } = req.user;
    const { name } = req.body;
    const Group = createDynamicModel("Group", organization);
    await Group.create({
      name,
    });
    return res.status(200).json({ message: "New group created successfully" });
  } catch (e) {
    if (e?.original?.errno === 1062) {
      return res.status(400).json({ message: `Duplicate entry` });
    }
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const editGroup = async (req, res) => {
  try {
    const { organization } = req.user;
    const { name, group_id } = req.body;
    const Group = createDynamicModel("Group", organization);
    await Group.update(
      {
        name,
      },
      { where: { id: group_id } }
    );
    return res.status(200).json({ message: "Group edited successfully" });
  } catch (e) {
    if (e?.original?.errno === 1062) {
      return res.status(400).json({ message: `Duplicate entry` });
    }
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { organization } = req.user;
    const { id: group_id } = req.body;
    const Group = createDynamicModel("Group", organization);
    const Good = createDynamicModel("Good", organization);
    await Good.update({ group_id: -1 }, { where: { group_id } });
    await Group.destroy({ where: { id: group_id } });
    return res.status(200).json({ message: "Group deleted successfully" });
  } catch (e) {
    if (e?.original?.errno === 1062) {
      return res.status(400).json({ message: `Duplicate entry` });
    }
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const createNewSpecie = async (req, res) => {
  try {
    const { organization } = req.user;
    const { status = "available", code, good_id } = req.body;
    const Specie = createDynamicModel("Specie", organization);
    await Specie.create({
      status,
      code,
      good: good_id,
    });
    return res.status(200).json({ message: "New specie created successfully" });
  } catch (e) {
    if (e?.original?.errno === 1062) {
      return res.status(400).json({ message: `Duplicate entry` });
    }
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const editSpecie = async (req, res) => {
  try {
    const { organization } = req.user;
    const { status, code, specie_id } = req.body;
    const Specie = createDynamicModel("Specie", organization);
    const specieInfo = await Specie.findOne({ where: { id: specie_id } });
    if (!specieInfo) {
      return res.status(400).json({ message: "Specie not found" });
    }
    const speciePlain = specieInfo.get({ plain: true });
    if (status && speciePlain.status === "busy") {
      return res.status(400).json({ message: "Specie is busy" });
    }
    await Specie.update(
      {
        status,
        code,
      },
      { where: { id: specie_id } }
    );
    return res.status(200).json({ message: "Specie edited successfully" });
  } catch (e) {
    console.log(e);
    if (e?.original?.errno === 1062) {
      return res.status(400).json({ message: `Duplicate entry` });
    }
    res.status(500).json({ message: "Unknown internal error" });
  }
};
