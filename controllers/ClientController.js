import { Op } from "sequelize";
import { createDynamicModel } from "../db/db.js";

export const createNewKZClient = async (req, res) => {
  try {
    const { organization } = req.user;
    const KZClient = createDynamicModel("KZClient", organization);
    const uppercaseKeys = ["name", "second_name", "father_name"];
    uppercaseKeys.forEach((item) => {
      if (req.body?.[item]) {
        req.body[item] = req.body[item].toUpperCase();
      }
    });
    await KZClient.create({ ...req.body, orders_count: 0 });
    return res.status(200).json({ message: "New client created successfully" });
  } catch (e) {
    if (e?.original?.errno === 1062) {
      return res.status(400).json({ message: `Duplicate entry` });
    }
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const editKZCLient = async (req, res) => {
  try {
    const { organization } = req.user;
    const { client_id } = req.body;
    const KZClient = createDynamicModel("KZClient", organization);
    const uppercaseKeys = ["name", "second_name", "father_name"];
    uppercaseKeys.forEach((item) => {
      if (req.body?.[item]) {
        req.body[item] = req.body[item].toUpperCase();
      }
    });
    await KZClient.update({ ...req.body }, { where: { id: client_id } });
    return res.status(200).json({ message: "Client edited successfully" });
  } catch (e) {
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getAllClients = async (req, res) => {
  try {
    const { organization } = req.user;
    const { page, pageSize, sortBy, sortOrder, filter } = req.query;
    const whereCondition = {};
    if (filter) {
      whereCondition[Op.and].push({ id: { [Op.like]: `%${filter}%` } });
      whereCondition[Op.and].push({ name: { [Op.like]: `%${filter}%` } });
    }
    const orderOptions = [[sortBy, sortOrder]];
    const Client = createDynamicModel("KZClient", organization);
    const result = await Client.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id",
        "cellphone",
        "name",
        "second_name",
        "father_name",
        "paper_person_id",
      ],
      order: orderOptions,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      group: `KZClient_${organization}.id`,
    });
    res.status(200).json({
      clients: result.rows,
      filteredTotalCount: result.count.length,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const searchForKZClient = async (req, res) => {
  try {
    const { organization } = req.user;
    const { searchText } = req.query;
    const everyWord = searchText.split(" ");
    const everyWordFiltered = everyWord.filter((i) => i !== "");
    const filterOptions = everyWordFiltered.map((item) => ({
      [Op.like]: `%${item}%`,
    }));
    const KZClient = createDynamicModel("KZClient", organization);
    const result = await KZClient.findAll({
      attributes: [
        "id",
        "paper_person_id",
        "name",
        "second_name",
        "father_name",
      ],
      limit: 50,
      where: {
        [Op.or]: [
          {
            paper_person_id: { [Op.or]: filterOptions },
          },
          {
            paper_serial_number: { [Op.or]: filterOptions },
          },
          {
            name: { [Op.or]: filterOptions },
          },
          {
            second_name: { [Op.or]: filterOptions },
          },
          {
            father_name: { [Op.or]: filterOptions },
          },
          {
            cellphone: { [Op.or]: filterOptions },
          },
        ],
      },
    });
    res.send(result);
  } catch (e) {
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getClientByIdKZ = async (req, res) => {
  try {
    const { organization } = req.user;
    const { client_id } = req.query;
    const KZClient = createDynamicModel("KZClient", organization);
    const result = await KZClient.findOne({ where: { id: client_id } });
    res.send(result);
  } catch (e) {
    res.status(500).json({ message: "Unknown internal error" });
  }
};
