import { createDynamicModel, Organization, User } from "../db/db.js";
import {
  actTemplates,
  contractTemplates,
} from "../contract_templates/Default_Templates.js";
import moment from "moment";
import config from "../config/config.json" assert { type: "json" };
import { customAlphabet } from "nanoid";
import { sendMessage } from "../service/SMSService.js";

const {
  SMS_EVERY_MS,
  TARIFF_UNITS_RU,
  CURRENCIES,
  TARIFF_MOMENT_KEYS,
  PAPER_AUTHORITY,
} = config;
const currency = "KZT";

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
      { signed: true, sign_date: new Date() },
      { where: { id: order_id } }
    );
    res.status(200).json({ message: "Code successfully confirmed" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const sendCode = async (req, res) => {
  try {
    const { organization_id, order_id, contract_code } = req.query;
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
    if (
      Date.now() - moment(order_plain.last_sign_sms).valueOf() <
      SMS_EVERY_MS
    ) {
      return res.status(404).json({
        message: `Try next time at ${moment(order_plain.last_sign_sms)
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
    res.status(200).json({ message: "SMS successfully sent" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getContract = async (req, res) => {
  try {
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
      supervisor: superVisorName,
      supervisor_short: superVisorShortName,
      template: organization_plain?.template,
      work_close_time: moment(organization_plain?.end_work, "HH:mm:ss").format(
        "HH:mm"
      ),
      work_open_time: moment(organization_plain?.start_work, "HH:mm:ss").format(
        "HH:mm"
      ),
    };
    const Order = createDynamicModel("Order", organization_id);
    const order = await Order.findOne({ where: { id: order_id } });
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
    const extensions = await Extension.findAll({
      where: { order_id: order_plain.id },
    });
    let renttime = 0;
    extensions.forEach((extension) => (renttime += extension.renttime));
    const Discount = createDynamicModel("Discount", organization_id);
    const discounts = await Discount.findAll({
      where: { order_id: order_plain.id },
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
        code: String(specie.get({ plain: true }).code).padStart(10, "0"),
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
      client_name: client_plain?.name,
      client_paper_person_id: client_plain?.paper_person_id,
      client_paper_serial_number: client_plain?.paper_serial_number,
      client_paper_authority: PAPER_AUTHORITY?.[client_plain?.paper_authority],
      client_second_name: client_plain?.second_name,
      client_father_name: client_plain?.father_name
        ? client_plain.father_name
        : "",
      discount: discountSum,
      goods: formattedGoods,
      order_id: order_plain.id,
      order_created_date: moment(order_plain?.created_date).format(
        "DD.MM.yyyy HH:mm:ss"
      ),
      order_started_date: moment(order_plain?.started_date).format(
        "DD.MM.yyyy"
      ),
      order_started_datetime: moment(order_plain?.started_date).format(
        "DD.MM.yyyy HH:mm"
      ),
      order_planned_date: moment(order_plain?.started_date)
        .add(renttime, TARIFF_MOMENT_KEYS[order_plain.tariff])
        .format("DD.MM.yyyy HH:mm"),
      payment_sum: sum - discountSum,
      signed: order_plain.signed,
      message_id: order_plain.message_id,
      last_sign_sms: moment(order_plain?.last_sign_sms).format(
        "DD.MM.yyyy HH:mm:ss"
      ),
      sign_date: moment(order_plain?.sign_date).format("DD.MM.yyyy HH:mm:ss"),
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
