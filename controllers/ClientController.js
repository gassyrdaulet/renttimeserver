import { Op } from "sequelize";
import { createDynamicModel, User } from "../db/db.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { DOMParser } from "xmldom";
import config from "../config/config.json" assert { type: "json" };
import { Sequelize } from "sequelize";

const { OPEN_GDB_API_KEY } = config;

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

export const getDebts = async (req, res) => {
  try {
    const { iin } = req.query;
    const soapEndpoint =
      "https://data.egov.kz/egov-opendata-ws/ODWebServiceImpl";
    const params = {};
    params.uid = uuidv4();
    params.date = new Date().toISOString();
    const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap.opendata.egov.nitec.kz/">
        <soapenv:Header/>
        <soapenv:Body>
            <soap:request>
                <request>
                    <requestInfo>
                        <messageId>${params.uid}</messageId>
                        <messageDate>${params.date}</messageDate>
                        <indexName>aisoip</indexName>
                        <apiKey>${OPEN_GDB_API_KEY}</apiKey>
                    </requestInfo>
                    <requestData>
                        <data xmlns:ns2pep="http://bip.bee.kz/SyncChannel/v10/Types/Request" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="ns2pep:RequestMessage">
                            <iinOrBin>${iin}</iinOrBin>
                        </data>
                    </requestData>
                </request>
            </soap:request>
        </soapenv:Body>
    </soapenv:Envelope>
  `;
    const axiosConfig = {
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
      },
    };
    const { data } = await axios.post(soapEndpoint, soapRequest, axiosConfig);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    const message = xmlDoc.getElementsByTagName("message")[0]?.textContent;
    const rowsElements = xmlDoc.getElementsByTagName("rows");
    const rowsData = Array.from(rowsElements).map((rowsElement) => {
      const rowData = {};
      Array.from(rowsElement.childNodes).forEach((childNode) => {
        if (childNode.nodeType === 1) {
          rowData[childNode.tagName] = childNode.textContent;
        }
      });
      return rowData;
    });
    res.status(200).json({ violations: rowsData, message });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getAllClients = async (req, res) => {
  try {
    const { organization } = req.user;
    const { page, pageSize, sortBy, sortOrder, filter } = req.query;
    const whereCondition = {};
    if (filter) {
      if (!whereCondition[Op.or]) {
        whereCondition[Op.or] = [];
      }
      const everyWord = filter.split(" ");
      const everyWordFiltered = everyWord.filter((i) => i !== "");
      const filterOptions = everyWordFiltered.map((item) => ({
        [Op.like]: `%${item}%`,
      }));
      whereCondition[Op.or].push({ id: { [Op.or]: filterOptions } });
      whereCondition[Op.or].push({ name: { [Op.or]: filterOptions } });
      whereCondition[Op.or].push({ second_name: { [Op.or]: filterOptions } });
      whereCondition[Op.or].push({ father_name: { [Op.or]: filterOptions } });
      whereCondition[Op.or].push({
        paper_person_id: { [Op.or]: filterOptions },
      });
      whereCondition[Op.or].push({
        paper_serial_number: { [Op.or]: filterOptions },
      });
      whereCondition[Op.or].push({ cellphone: { [Op.or]: filterOptions } });
    }
    const orderOptions = [];
    if (sortBy === "debts_sum") {
      orderOptions.push([Sequelize.literal(sortBy), sortOrder]);
    } else {
      orderOptions.push([sortBy, sortOrder]);
    }
    const Client = createDynamicModel("KZClient", organization);
    const Debt = createDynamicModel("Debt", organization);
    Client.hasMany(Debt, { foreignKey: "client_id", as: "debts" });
    const result = await Client.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id",
        "cellphone",
        "name",
        "second_name",
        "father_name",
        "paper_person_id",
        "create_date",
        [
          Sequelize.literal(
            `(SELECT SUM(amount) FROM debts_${organization} WHERE debts_${organization}.client_id = KZClient_${organization}.id AND debts_${organization}.closed = false)`
          ),
          "debts_sum",
        ],
      ],
      include: [
        {
          model: Debt,
          as: "debts",
          required: false,
          attributes: ["amount", "id", "closed"],
        },
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
            id: { [Op.or]: filterOptions },
          },
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
    const Violation = createDynamicModel("Violation", organization);
    const Debt = createDynamicModel("Debt", organization);
    KZClient.hasMany(Violation, { foreignKey: "client_id", as: "violations" });
    KZClient.hasMany(Debt, { foreignKey: "client_id", as: "debts" });
    Violation.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    Debt.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    const result = await KZClient.findOne({
      where: { id: client_id },
      include: [
        {
          model: Debt,
          as: "debts",
          required: false,
          include: [
            {
              model: User,
              attributes: ["name", "id", "cellphone"],
              as: "userInfo",
              required: false,
            },
          ],
        },
        {
          model: Violation,
          as: "violations",
          required: false,
          include: [
            {
              model: User,
              attributes: ["name", "id", "cellphone"],
              as: "userInfo",
              required: false,
            },
          ],
        },
      ],
    });
    res.send(result);
  } catch (e) {
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { organization } = req.user;
    const { client_id } = req.query;
    const KZClient = createDynamicModel("KZClient", organization);
    const Violation = createDynamicModel("Violation", organization);
    const Debt = createDynamicModel("Debt", organization);
    KZClient.hasMany(Violation, { foreignKey: "client_id", as: "violations" });
    KZClient.hasMany(Debt, { foreignKey: "client_id", as: "debts" });
    Violation.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    Debt.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    const result = await KZClient.findOne({
      where: { id: client_id },
      include: [
        {
          model: Debt,
          as: "debts",
          required: false,
          include: [
            {
              model: User,
              attributes: ["name", "id"],
              as: "userInfo",
              required: false,
            },
          ],
        },
        {
          model: Violation,
          as: "violations",
          required: false,
          include: [
            {
              model: User,
              attributes: ["name", "id"],
              as: "userInfo",
              required: false,
            },
          ],
        },
      ],
    });
    const debtSum = result.debts.reduce((accumulator, currentValue) => {
      return currentValue.closed
        ? accumulator
        : accumulator + currentValue.amount;
    }, 0);
    if (debtSum !== 0) {
      return res
        .status(400)
        .json({ message: "Can not delete Client. Debt sum must be 0" });
    }
    if (result.violations.length > 0) {
      return res
        .status(400)
        .json({ message: "Can not delete Client. Client has violations" });
    }
    await KZClient.destroy({ where: { id: client_id } });
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const newDebt = async (req, res) => {
  try {
    const { organization, id: userId } = req.user;
    const { client_id, comment, amount, date } = req.body;
    const Debt = createDynamicModel("Debt", organization);
    const Workshift = createDynamicModel("Workshift", organization);
    const workshift = await Workshift.findOne({
      attributes: ["id"],
      where: { responsible: userId, close_date: null },
    });
    if (!workshift) {
      return res.status(400).json({ message: "Workshift not found" });
    }
    const workshift_id = workshift.get({ plain: true }).id;
    const createData = { client_id, amount, user_id: userId, workshift_id };
    if (comment) {
      createData.comment = comment;
    }
    if (date) {
      createData.date = date;
    }
    await Debt.create(createData);
    res.status(200).json({ message: "Debt created successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const closeDebt = async (req, res) => {
  try {
    const { organization, id: userId } = req.user;
    const { debt_id, payment_method_id } = req.query;
    const Debt = createDynamicModel("Debt", organization);
    const Workshift = createDynamicModel("Workshift", organization);
    const workshift = await Workshift.findOne({
      attributes: ["id"],
      where: { responsible: userId, close_date: null },
    });
    if (!workshift) {
      return res.status(400).json({ message: "Workshift not found" });
    }
    const workshift_id = workshift.get({ plain: true }).id;
    const PaymentMethod = createDynamicModel("PaymentMethod", organization);
    const method = await PaymentMethod.findOne({
      where: { id: payment_method_id },
    });
    if (!method) {
      return res.status(400).json({ message: "Payment method was not found" });
    }
    const method_plain = method.get({ plain: true });
    const Operation = createDynamicModel("Operation", organization);
    const debtInfo = await Debt.findOne({ where: { id: debt_id } });
    if (!debtInfo) {
      return res.status(400).json({ message: "Долг не найден" });
    }
    const debtPlain = debtInfo.get({ plain: true });
    await Debt.update({ closed: true }, { where: { id: debt_id } });
    await Operation.create({
      amount: debtPlain.amount,
      type: "debt",
      positive: debtPlain.amount > 0,
      workshift_id,
      fee: (debtPlain.amount * method_plain.comission) / 100,
      payment_method: method_plain.name,
    });
    res.status(200).json({ message: "Debt closed successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};
