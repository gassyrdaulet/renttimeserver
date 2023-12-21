import { createDynamicModel } from "../db/db.js";
import { Op } from "sequelize";
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

export const getGoodDetails = async (req, res) => {
  try {
    const { organization } = req.user;
    const { good_id } = req.query;
    const Good = createDynamicModel("Good", organization);
    const good = await Good.findOne({ where: { id: good_id } });
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
      group,
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
        group_id: group,
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
