import { createDynamicModel, User } from "../db/db.js";
import { Op } from "sequelize";
import { controlOrdersCount } from "../service/ClientService.js";
import { sendMessage } from "../service/SMSService.js";
import config from "../config/config.json" assert { type: "json" };
import { customAlphabet } from "nanoid";

const { TARIFF_KEYS } = config;

export const createNewOrder = async (req, res) => {
  try {
    const workshift_id = 1;
    const { organization, id: userId } = req.user;
    const {
      goods,
      tariff,
      renttime,
      comment,
      client,
      started_date,
      forgive_lateness_ms,
      discount,
      deliveryHere,
      deliveryThere,
      discountReason,
    } = req.body;
    const Order = createDynamicModel("Order", organization);
    const OrderGood = createDynamicModel("OrderGood", organization);
    const Client = createDynamicModel("KZClient", organization);
    const Specie = createDynamicModel("Specie", organization);
    const Good = createDynamicModel("Good", organization);
    const Extension = createDynamicModel("Extension", organization);
    const Discount = createDynamicModel("Discount", organization);
    const Delivery = createDynamicModel("Delivery", organization);
    const idsToSearch = goods.map((item) => item.id);
    const clientInfo = (await Client.findOne({ where: { id: client } })).get({
      plain: true,
    });
    const species = await Specie.findAll({
      where: { id: { [Op.in]: idsToSearch } },
    });
    const link_code = customAlphabet("abcdefghijklmnopqrstuvwxyz", 6)();
    const sign_code = customAlphabet("1234567890", 6)();
    const newOrder = (
      await Order.create({
        author: userId,
        client,
        tariff,
        workshift_id,
        started_date,
        comment,
        link_code,
        sign_code,
        forgive_lateness_ms,
      })
    ).get({
      plain: true,
    });
    try {
      for (let specie of species) {
        if (specie.status !== "available") {
          throw new Error(
            `The Specie is not available at the moment (Specie Id: ${specie.id})`
          );
        }
        const good = await Good.findOne({ where: { id: specie.good } });
        if (!good) {
          throw new Error(
            `The Good was not found (Specie Id: ${specie.id}, Good Id: ${specie.good})`
          );
        }
        const good_plain = good.get({ plain: true });
        await OrderGood.create({
          order_id: newOrder.id,
          specie_id: specie.id,
          saved_price: good_plain?.[TARIFF_KEYS?.[newOrder?.tariff]],
          saved_compensation_price: good_plain.compensation_price,
          good_id: specie.good,
        });
        await Specie.update(
          { status: "busy", order: newOrder.id },
          { where: { id: specie.id } }
        );
      }
      await Extension.create({
        order_id: newOrder.id,
        user_id: userId,
        workshift_id,
        renttime,
      });
      const message_id = await sendMessage(
        clientInfo.cellphone,
        "Здравствуйте! Вы оформляете заказ аренды. Перейдите по этой ссылке для подписания договора: " +
          `${process.env.DOMEN}/contract/${organization}/${newOrder.id}/${link_code}`
      );
      await Order.update({ message_id }, { where: { id: newOrder.id } });
      if (discount)
        await Discount.create({
          order_id: newOrder.id,
          workshift_id,
          amount: discount,
          reason: discountReason ? discountReason : "",
          user_id: userId,
        });
      if (deliveryHere)
        await Delivery.create({
          ...deliveryHere,
          order_id: newOrder.id,
          workshift_id,
          status: "new",
          direction: "here",
          user_id: userId,
        });
      if (deliveryThere)
        await Delivery.create({
          ...deliveryThere,
          order_id: newOrder.id,
          workshift_id,
          status: "new",
          direction: "there",
          user_id: userId,
        });
    } catch (e) {
      for (let specie of species) {
        await Specie.update(
          { status: specie.status, order: specie.order },
          { where: { id: specie.id } }
        );
      }
      await Extension.destroy({ where: { order_id: newOrder.id } });
      await Discount.destroy({ where: { order_id: newOrder.id } });
      await Delivery.destroy({ where: { order_id: newOrder.id } });
      await OrderGood.destroy({ where: { order_id: newOrder.id } });
      await Order.destroy({ where: { id: newOrder.id } });
      return res.status(400).json({ message: e.message });
    }
    await controlOrdersCount(1, organization, client);
    res.status(200).json({ message: "New order created successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const excludedAttributesOrders = [
      "comment",
      "for_increment",
      "last_sign_sms",
      "link_code",
      "message_id",
      "sign_code",
      "sign_date",
      "workshift_id",
    ];
    const { organization } = req.user;
    const { page, pageSize, sortBy, sortOrder, filter } = req.query;
    const finalFilter = filter ? filter : "";
    const whereCondition = {
      [Op.or]: [{ id: { [Op.like]: `%${finalFilter}%` } }],
      [Op.and]: [{ for_increment: false }],
    };
    const orderOptions = [[sortBy, sortOrder]];
    const Order = createDynamicModel("Order", organization);
    const Delivery = createDynamicModel("Delivery", organization);
    const Extension = createDynamicModel("Extension", organization);
    const Discount = createDynamicModel("Discount", organization);
    const OrderGood = createDynamicModel("OrderGood", organization);
    const Payment = createDynamicModel("Payment", organization);
    Order.hasMany(OrderGood, { foreignKey: "order_id", as: "orderGoods" });
    Order.hasMany(Extension, { foreignKey: "order_id", as: "extensions" });
    Order.hasMany(Discount, { foreignKey: "order_id", as: "discounts" });
    Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
    Order.hasMany(Delivery, { foreignKey: "order_id", as: "deliveries" });
    const result = await Order.findAndCountAll({
      attributes: { exclude: excludedAttributesOrders },
      where: whereCondition,
      order: orderOptions,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          model: OrderGood,
          as: "orderGoods",
          attributes: ["saved_price"],
          required: false,
        },
        {
          model: Extension,
          as: "extensions",
          attributes: ["renttime"],
          required: false,
        },
        {
          model: Discount,
          as: "discounts",
          attributes: ["amount"],
          required: false,
        },
        {
          model: Payment,
          as: "payments",
          attributes: ["amount"],
          required: false,
        },
        {
          model: Delivery,
          as: "deliveries",
          attributes: ["delivery_price_for_customer"],
          required: false,
        },
      ],
      group: `Order_${organization}.id`,
    });
    res.status(200).json({
      orders: result.rows,
      filteredTotalCount: result.count.length,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const excludedAttributesOrders = [
      "for_increment",
      "message_id",
      "sign_code",
    ];
    const { organization } = req.user;
    const { order_id } = req.query;
    const Client = createDynamicModel("KZClient", organization);
    const Order = createDynamicModel("Order", organization);
    const Delivery = createDynamicModel("Delivery", organization);
    const Extension = createDynamicModel("Extension", organization);
    const Specie = createDynamicModel("Specie", organization);
    const Good = createDynamicModel("Good", organization);
    const Discount = createDynamicModel("Discount", organization);
    const OrderGood = createDynamicModel("OrderGood", organization);
    const Payment = createDynamicModel("Payment", organization);
    Order.hasMany(OrderGood, { foreignKey: "order_id", as: "orderGoods" });
    Order.hasMany(Extension, { foreignKey: "order_id", as: "extensions" });
    Order.hasMany(Discount, { foreignKey: "order_id", as: "discounts" });
    Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
    Order.hasMany(Delivery, { foreignKey: "order_id", as: "deliveries" });
    Order.belongsTo(Client, { foreignKey: "client", as: "clientInfo" });
    OrderGood.belongsTo(Good, { foreignKey: "good_id", as: "good" });
    OrderGood.belongsTo(Specie, { foreignKey: "specie_id", as: "specie" });
    Extension.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    Payment.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    Discount.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    Delivery.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    const result = await Order.findOne({
      attributes: { exclude: excludedAttributesOrders },
      where: { id: order_id },
      include: [
        {
          model: Client,
          as: "clientInfo",
          required: false,
        },
        {
          model: OrderGood,
          as: "orderGoods",
          attributes: ["saved_price"],
          required: false,
          include: [
            { model: Good, as: "good", required: false },
            { model: Specie, as: "specie", required: false },
          ],
        },
        {
          model: Extension,
          as: "extensions",
          attributes: { exclude: ["order_id"] },
          required: false,
          include: {
            model: User,
            as: "userInfo",
            attributes: ["name", "id", "cellphone"],
            required: false,
          },
        },
        {
          model: Discount,
          as: "discounts",
          attributes: { exclude: ["order_id"] },
          required: false,
          include: {
            model: User,
            as: "userInfo",
            attributes: ["name", "id", "cellphone"],
            required: false,
          },
        },
        {
          model: Payment,
          as: "payments",
          attributes: { exclude: ["order_id"] },
          required: false,
          include: {
            model: User,
            as: "userInfo",
            attributes: ["name", "id", "cellphone"],
            required: false,
          },
        },
        {
          model: Delivery,
          as: "deliveries",
          attributes: { exclude: ["order_id"] },
          required: false,
          include: {
            model: User,
            as: "userInfo",
            attributes: ["name", "id", "cellphone"],
            required: false,
          },
        },
      ],
    });
    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const newPayment = async (req, res) => {
  try {
    const workshift_id = 1;
    const { organization, id: userId } = req.user;
    const { order_id, amount, payment_method_id, is_debt, date } = req.body;
    const Role = createDynamicModel("Role", organization);
    const roles = await Role.findOne({ where: { id: userId } });
    if (is_debt) {
      if (!roles.debt) {
        return res
          .status(400)
          .json({ message: "Access denied. You can't create debt payment" });
      }
    }
    const PaymentMethod = createDynamicModel("PaymentMethod", organization);
    const Payment = createDynamicModel("Payment", organization);
    const method = await PaymentMethod.findOne({
      where: { id: payment_method_id },
    });
    if (!method) {
      return res.status(400).json({ message: "Payment method was not found" });
    }
    const method_plain = method.get({ plain: true });
    const data = {
      order_id,
      amount,
      type: method_plain.name,
      fee: (amount * method_plain.comission) / 100,
      user_id: userId,
      workshift_id,
      is_debt,
      verified: true,
    };
    console.log(date);
    if (date) {
      data.date = date;
    }
    await Payment.create(data);
    res.status(200).json({ message: "New payment created succesfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const newExtension = async (req, res) => {
  try {
    const workshift_id = 1;
    const { organization, id: userId } = req.user;
    const { order_id, renttime, date } = req.body;
    const Extension = createDynamicModel("Extension", organization);
    const data = {
      order_id,
      renttime,
      user_id: userId,
      workshift_id,
    };
    if (date) {
      data.date = date;
    }
    await Extension.create(data);
    res.status(200).json({ message: "New extension created succesfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};
