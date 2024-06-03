import { createDynamicModel, Organization, User } from "../db/db.js";
import {
  actTemplates,
  contractTemplates,
} from "../contract_templates/Default_Templates.js";
import momentjs from "moment";
import config from "../config/config.json" assert { type: "json" };
import { customAlphabet } from "nanoid";
import { sendMessage } from "../service/SMSService.js";
import { Op } from "sequelize";
import { updateQR, updateTable } from "../service/DocumentService.js";
import fs from "fs/promises";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { directoryExists } from "../service/ImageServise.js";

const SERVER_URL = `${process.env.DOMEN}:${process.env.S_PORT}/`;
const {
  SMS_EVERY_MS,
  TARIFF_UNITS_RU,
  CURRENCIES,
  TARIFF_MOMENT_KEYS,
  PAPER_AUTHORITY,
} = config;
const currency = "KZT";

async function readFileWithFallback(templatePath, templatePathDefault) {
  let content;
  try {
    content = await fs.readFile(templatePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      content = await fs.readFile(templatePathDefault);
    } else {
      throw error;
    }
  }
  return content;
}

async function getTemplateWithFallback(organization) {
  let content;
  try {
    content = JSON.parse(
      (
        await fs.readFile(`./contract_templates/${organization}.json`)
      ).toString()
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      content = [
        { title: "№", width: 500, key: "index", source: null },
        { title: "Наименование", width: 4500, key: "name", source: "goodInfo" },
        { title: "Инв. номер", width: 1500, key: "specie_id", source: null },
        { title: "Цена, тенге", width: 1500, key: "saved_price", source: null },
        {
          title: "Стоимость оборудования, тенге",
          width: 2000,
          key: "saved_compensation_price",
          source: null,
        },
      ];
    } else {
      throw error;
    }
  }
  return content;
}

export const confirmCode = async (req, res) => {
  try {
    const { organization_id, order_id, contract_code, sign_code } = req.query;
    const organization = await Organization.findOne({
      where: { id: organization_id },
    });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    const organization_plain = organization.get({ plain: true });
    const Order = createDynamicModel("Order", organization_plain.id);
    const order = await Order.findOne({ where: { id: order_id } });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const order_plain = order.get({ plain: true });
    if (order_plain.signed) {
      return res.status(404).json({ message: "Contract already signed" });
    }
    if (order_plain.link_code !== contract_code) {
      return res.status(404).json({ message: "Contract code is not correct" });
    }
    if (order_plain.sign_code !== sign_code) {
      return res.status(404).json({ message: "Sign code is not correct" });
    }
    await Order.update(
      { signed: true, sign_date: new Date(), sign_type: "remote" },
      { where: { id: order_id, for_increment: false } }
    );
    res.status(200).json({ message: "Code successfully confirmed" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const sendCode = async (req, res) => {
  try {
    const tzname = "Asia/Almaty";
    const { organization_id, order_id, contract_code } = req.query;
    const organization = await Organization.findOne({
      where: { id: organization_id },
    });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    const organization_plain = organization.get({ plain: true });
    const Order = createDynamicModel("Order", organization_plain.id);
    const order = await Order.findOne({
      attributes: ["id", "signed", "link_code", "last_sign_sms", "client"],
      where: { id: order_id },
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const order_plain = order.get({ plain: true });
    if (order_plain.signed) {
      return res.status(404).json({ message: "Contract already signed" });
    }
    if (order_plain.link_code !== contract_code) {
      return res.status(404).json({ message: "Contract code is not correct" });
    }
    if (
      Date.now() - momentjs(order_plain.last_sign_sms).valueOf() <
      SMS_EVERY_MS
    ) {
      return res.status(404).json({
        message: `Try next time at ${momentjs(order_plain.last_sign_sms)
          .tz(tzname)
          .add(SMS_EVERY_MS, "milliseconds")
          .format("DD.MM.yyyy HH:mm:ss")}`,
      });
    }
    const Client = createDynamicModel("KZClient", organization_id);
    const client = await Client.findOne({ where: { id: order_plain.client } });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    const client_plain = client.get({ plain: true });
    const sign_code = customAlphabet("1234567890", 6)();
    const message_id = await sendMessage(
      client_plain.cellphone,
      `Код для подписания заказа №${order_id}: ${sign_code}`
    );
    await Order.update(
      { sign_code, message_id, last_sign_sms: new Date() },
      { where: { id: order_id } }
    );
    res.status(200).json({ message: "SMS code successfully sent" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getContract = async (req, res) => {
  try {
    const tzname = "Asia/Almaty";
    const { organization_id, order_id, contract_code } = req.query;
    const organization = await Organization.findOne({
      where: { id: organization_id },
    });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    const organization_plain = organization.get({ plain: true });
    const owner = await User.findOne({
      where: { id: organization_plain.owner },
    });
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }
    const owner_plain = owner.get({ plain: true });
    const superVisorName = `${owner?.second_name} ${owner?.name} ${
      owner?.father_name ? owner.father_name : ""
    }`;
    const superVisorShortName = `${owner?.second_name} ${owner?.name?.[0]}.${
      owner?.father_name ? owner.father_name?.[0] + "." : ""
    }`;
    const organization_data = {
      address: organization_plain?.address,
      bank_company_name: organization_plain?.bank_company_name,
      bank_company_type: organization_plain?.bank_company_type,
      cellphone: owner_plain?.cellphone,
      city: organization_plain?.city,
      company_name: organization_plain?.company_name,
      company_type: organization_plain?.company_type,
      currency: `${CURRENCIES[currency]}`,
      kz_paper_bik: organization_plain?.kz_paper_bik,
      kz_paper_bin: organization_plain?.kz_paper_bin,
      kz_paper_iik: organization_plain?.kz_paper_iik,
      orgName: organization_plain?.name,
      supervisor: superVisorName,
      supervisor_short: superVisorShortName,
      template: organization_plain?.template,
      work_close_time: momentjs(
        organization_plain?.end_work,
        "HH:mm:ss"
      ).format("HH:mm"),
      work_open_time: momentjs(
        organization_plain?.start_work,
        "HH:mm:ss"
      ).format("HH:mm"),
      yearTwoDigits: momentjs().format("YY"),
    };
    const OrderForCheck = createDynamicModel("Order", organization_id);
    const orderForCheck = await OrderForCheck.findOne({
      where: { id: order_id, for_increment: false },
    });
    const Order = createDynamicModel(
      orderForCheck ? "Order" : "ArchiveOrder",
      organization_id
    );
    const order = await Order.findOne({
      where: { id: order_id, for_increment: false },
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.get({ plain: true }).link_code !== contract_code) {
      return res.status(404).json({ message: "Contract code is not correct" });
    }
    const order_plain = order.get({ plain: true });
    const Client = createDynamicModel("KZClient", organization_id);
    const client = await Client.findOne({ where: { id: order_plain.client } });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    const client_plain = client.get({ plain: true });
    const Extension = createDynamicModel("Extension", organization_id);
    const whereCondition = { order_id: order_plain.id };
    if (order_plain.sign_date) {
      whereCondition.date = { [Op.lt]: order_plain.sign_date };
    }
    const extensions = await Extension.findAll({
      where: whereCondition,
    });
    let renttime = 0;
    extensions.forEach((extension) => (renttime += extension.renttime));
    const Discount = createDynamicModel("Discount", organization_id);
    const discounts = await Discount.findAll({
      where: whereCondition,
    });
    let discountSum = 0;
    discounts.forEach((discount) => (discountSum += discount.amount));
    const OrderGood = createDynamicModel("OrderGood", organization_id);
    const Good = createDynamicModel("Good", organization_id);
    const Specie = createDynamicModel("Specie", organization_id);
    const orderGoods = await OrderGood.findAll({
      where: { order_id: order_plain.id },
    });
    const formattedGoods = [];
    for (let orderGood of orderGoods) {
      const good = await Good.findOne({ where: { id: orderGood.good_id } });
      if (!good) {
        return res.status(404).json({ message: "Good not found" });
      }
      const specie = await Specie.findOne({
        where: { id: orderGood.specie_id },
      });
      if (!specie) {
        return res.status(404).json({ message: "Specie not found" });
      }
      formattedGoods.push({
        name: good.get({ plain: true }).name,
        code: `${good.get({ plain: true }).id}/${
          specie.get({ plain: true }).id
        }`,
        price: orderGood.saved_price,
        compensation_price: orderGood.saved_compensation_price,
      });
    }
    let sum = 0;
    let compensation_sum = 0;
    formattedGoods.forEach((item) => {
      compensation_sum += item.compensation_price;
      sum += item.price * renttime;
    });
    const order_data = {
      client_address: client_plain?.address,
      client_cellphone: client_plain?.cellphone,
      client_born_date: momentjs(
        client_plain?.paper_person_id?.slice(0, 6),
        "YYMMDD"
      )
        .tz(tzname)
        .format("DD.MM.YYYY"),
      client_born_region: client_plain?.born_region,
      client_city: client_plain?.city,
      client_name: client_plain?.name,
      client_nationality: client_plain?.nationality,
      client_paper_authority: PAPER_AUTHORITY?.[client_plain?.paper_authority],
      client_paper_givendate: momentjs(client_plain?.paper_givendate)
        .tz(tzname)
        .format("DD.MM.YYYY"),
      client_paper_person_id: client_plain?.paper_person_id,
      client_paper_serial_number: client_plain?.paper_serial_number,
      client_second_name: client_plain?.second_name,
      client_father_name: client_plain?.father_name
        ? client_plain.father_name
        : "",
      discount: discountSum,
      finished_date: momentjs(order_plain?.finished_date)
        .tz(tzname)
        .format("DD.MM.yyyy HH:mm:ss"),
      goods: formattedGoods,
      order_id: order_plain.id,
      order_created_date: momentjs(order_plain?.created_date)
        .tz(tzname)
        .format("DD.MM.yyyy HH:mm:ss"),
      order_started_date: momentjs(order_plain?.started_date)
        .tz(tzname)
        .format("DD.MM.yyyy"),
      order_started_datetime: momentjs(order_plain?.started_date)
        .tz(tzname)
        .format("DD.MM.yyyy HH:mm"),
      order_planned_datetime: momentjs(order_plain?.started_date)
        .add(renttime, TARIFF_MOMENT_KEYS[order_plain.tariff])
        .tz(tzname)
        .format("DD.MM.yyyy HH:mm"),
      payment_sum: sum - discountSum,
      signed: order_plain.signed,
      message_id: order_plain.message_id,
      last_sign_sms: momentjs(order_plain?.last_sign_sms)
        .tz(tzname)
        .format("DD.MM.yyyy HH:mm:ss"),
      sign_date: momentjs(order_plain?.sign_date)
        .tz(tzname)
        .format("DD.MM.yyyy HH:mm:ss"),
      sign_type: order_plain.sign_type,
      sum,
      compensation_sum,
      tariff_units: `${CURRENCIES[currency]}/${
        TARIFF_UNITS_RU[order_plain.tariff]
      }`,
    };
    res.status(200).json({
      message: "Success",
      actTemplate: actTemplates.original,
      contractTemplate: contractTemplates.original,
      order_data,
      organization_data,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getContractDocx = async (req, res) => {
  try {
    const tzname = "Asia/Almaty";
    const { organization_id, order_id, contract_code } = req.query;
    const organization = await Organization.findOne({
      where: { id: organization_id },
      include: [
        {
          model: User,
          as: "ownerInfo",
          required: true,
          attributes: ["father_name", "name", "second_name", "cellphone"],
        },
      ],
    });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    const templatePathDefault = "./contract_templates/default.docx";
    const templatePath = `./contract_templates/${organization_id}.docx`;
    const tableTemplate = await getTemplateWithFallback(organization_id);
    const organization_plain = organization.get({ plain: true });
    const { ownerInfo } = organization_plain;
    const superVisorName = `${ownerInfo?.second_name} ${ownerInfo?.name} ${
      ownerInfo?.father_name ? ownerInfo.father_name : ""
    }`;
    const superVisorShortName = `${ownerInfo?.second_name} ${
      ownerInfo?.name?.[0]
    }.${ownerInfo?.father_name ? ownerInfo.father_name?.[0] + "." : ""}`;

    const OrderForCheck = createDynamicModel("Order", organization_id);
    const orderForCheck = await OrderForCheck.findOne({
      where: { id: order_id, for_increment: false },
    });
    const Order = createDynamicModel(
      orderForCheck ? "Order" : "ArchiveOrder",
      organization_id
    );
    const Client = createDynamicModel("KZClient", organization_id);
    const OrderGood = createDynamicModel("OrderGood", organization_id);
    const Good = createDynamicModel("Good", organization_id);
    Order.belongsTo(Client, { foreignKey: "client", as: "clientInfo" });
    Order.hasMany(OrderGood, { foreignKey: "order_id", as: "orderGoods" });
    OrderGood.belongsTo(Good, { foreignKey: "good_id", as: "goodInfo" });
    const order = await Order.findOne({
      where: { id: order_id, for_increment: false },
      include: [
        { model: Client, as: "clientInfo", required: true },
        {
          model: OrderGood,
          as: "orderGoods",
          include: [{ model: Good, as: "goodInfo" }],
        },
      ],
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const order_plain = order.get({ plain: true });
    if (order_plain.link_code !== contract_code) {
      return res.status(404).json({ message: "Contract code is not correct" });
    }
    const client_plain = order_plain.clientInfo;
    const Extension = createDynamicModel("Extension", organization_id);
    const whereCondition = { order_id: order_plain.id };
    if (order_plain.sign_date) {
      whereCondition.date = { [Op.lt]: order_plain.sign_date };
    }
    const extensions = await Extension.findAll({
      where: whereCondition,
    });
    let renttime = 0;
    extensions.forEach((extension) => (renttime += extension.renttime));
    const Discount = createDynamicModel("Discount", organization_id);
    const discounts = await Discount.findAll({
      where: whereCondition,
    });
    let discountSum = 0;
    discounts.forEach((discount) => (discountSum += discount.amount));
    const { orderGoods } = order_plain;
    const formattedGoods = [];
    const units = `${CURRENCIES[currency]}/${
      TARIFF_UNITS_RU[order_plain.tariff]
    }`;
    orderGoods.forEach((orderGood, index) => {
      orderGood.index = index + 1;
      const row = {};
      tableTemplate.forEach((column) => {
        const { source, key, title } = column;
        const value = source ? orderGood[source][key] : orderGood[key];
        row[title] = value;
      });
      formattedGoods.push(row);
    });
    let sum = 0;
    let compensation_sum = 0;
    orderGoods.forEach((orderGood) => {
      compensation_sum += orderGood.saved_compensation_price;
      sum += orderGood.saved_price * renttime;
    });
    const orderData = {
      client_address: client_plain?.address,
      client_cellphone: client_plain?.cellphone,
      client_born_date: momentjs(
        client_plain?.paper_person_id?.slice(0, 6),
        "YYMMDD"
      )
        .tz(tzname)
        .format("DD.MM.YYYY"),
      client_born_region: client_plain?.born_region,
      client_city: client_plain?.city,
      client_name: client_plain?.name,
      client_nationality: client_plain?.nationality,
      client_paper_authority: PAPER_AUTHORITY?.[client_plain?.paper_authority],
      client_paper_givendate: momentjs(client_plain?.paper_givendate).isValid
        ? momentjs(client_plain?.paper_givendate)
            .tz(tzname)
            .format("DD.MM.YYYY")
        : "-",
      client_paper_person_id: client_plain?.paper_person_id,
      client_paper_serial_number: client_plain?.paper_serial_number,
      client_second_name: client_plain?.second_name,
      client_father_name: client_plain?.father_name
        ? client_plain.father_name
        : "",
      discount: discountSum,
      finished_date: momentjs(order_plain?.finished_date)
        .tz(tzname)
        .format("DD.MM.yyyy HH:mm:ss"),
      order_id: order_plain.id,
      order_created_date: momentjs(order_plain?.created_date)
        .tz(tzname)
        .format("DD.MM.yyyy HH:mm:ss"),
      order_started_date: momentjs(order_plain?.started_date)
        .tz(tzname)
        .format("DD.MM.yyyy"),
      order_started_datetime: momentjs(order_plain?.started_date)
        .tz(tzname)
        .format("DD.MM.yyyy HH:mm"),
      order_planned_datetime: momentjs(order_plain?.planned_date)
        .tz(tzname)
        .format("DD.MM.yyyy HH:mm"),
      payment_sum: sum - discountSum,
      signed: order_plain.signed,
      message_id: order_plain.message_id,
      last_sign_sms: momentjs(order_plain?.last_sign_sms)
        .tz(tzname)
        .format("DD.MM.yyyy HH:mm:ss"),
      sign_date: momentjs(order_plain?.sign_date)
        .tz(tzname)
        .format("DD.MM.yyyy HH:mm:ss"),
      sign_type: order_plain.sign_type,
      sum,
      compensation_sum,
      tariff_units: units,
    };
    const data = {
      ...orderData,
      address: organization_plain?.address,
      bank_company_name: organization_plain?.bank_company_name,
      bank_company_type: organization_plain?.bank_company_type,
      cellphone: ownerInfo?.cellphone,
      city: organization_plain?.city,
      company_name: organization_plain?.company_name,
      company_type: organization_plain?.company_type,
      currency: `${CURRENCIES[currency]}`,
      kz_paper_bik: organization_plain?.kz_paper_bik,
      kz_paper_bin: organization_plain?.kz_paper_bin,
      kz_paper_iik: organization_plain?.kz_paper_iik,
      orgName: organization_plain?.name,
      supervisor: superVisorName,
      supervisor_short: superVisorShortName,
      template: organization_plain?.template,
      work_close_time: momentjs(
        organization_plain?.end_work,
        "HH:mm:ss"
      ).format("HH:mm"),
      work_open_time: momentjs(
        organization_plain?.start_work,
        "HH:mm:ss"
      ).format("HH:mm"),
      yearTwoDigits: momentjs().format("YY"),
      table: "{{table}}",
      qrorg: "{{qrorg}}",
      qrlink1: "{{qrlink1}}",
      qrlink2: "{{qrlink2}}",
      qrclient: "{{qrclient}}",
    };
    const content = await readFileWithFallback(
      templatePath,
      templatePathDefault
    );
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    doc.setData(data);
    doc.render();
    const qrclient = {};
    if (orderData.sign_type === "remote") {
      qrclient.iin = orderData.client_paper_person_id;
      qrclient.sign_date = orderData.sign_date;
      qrclient.sms_date = orderData.last_sign_sms;
      qrclient.serial_no = orderData.client_paper_serial_number;
      qrclient.client_cp = orderData.client_cellphone;
    }
    const qrorg = {
      bin: data.kz_paper_bin,
      sign_date: orderData.order_created_date,
      org_cp: orderData.cellphone,
    };
    const qrlink = `${process.env.DOMEN}/contract/${organization_id}/${order_id}/${contract_code}`;
    const buf = doc.getZip().generate({ type: "nodebuffer" });
    const bufWithTable = await updateTable(
      buf,
      {
        table: formattedGoods,
      },
      tableTemplate.map((item) => item.width)
    );
    const bufWithQR = await updateQR(bufWithTable, {
      qrorg,
      qrclient,
      qrlink1: { url: qrlink },
      qrlink2: orderData.sign_type === "remote" ? { url: qrlink } : {},
    });
    const directoryPath = `./contracts/${organization_id}/`;
    if (!(await directoryExists(directoryPath))) {
      await fs.mkdir(directoryPath, { recursive: true });
    }
    await fs.writeFile(
      `./contracts/${organization_id}/contract_${order_id}_${contract_code}.docx`,
      bufWithQR
    );
    res.status(200).json({
      orderData,
      doc: `${SERVER_URL}contracts/${organization_id}/contract_${order_id}_${contract_code}.docx`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};
