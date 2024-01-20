import { createDynamicModel, User, Organization } from "../db/db.js";
import { Op } from "sequelize";
import { controlOrdersCount } from "../service/ClientService.js";
import { sendMessage } from "../service/SMSService.js";
import config from "../config/config.json" assert { type: "json" };
import { customAlphabet } from "nanoid";
import moment from "moment";

const { TARIFF_KEYS, TARIFF_MOMENT_KEYS, MAXIMUM_ARCHIVE_RANGE_DAYS } = config;
const smsLink = `Договор аренды: ${process.env.DOMEN}/contract/`;

export const createNewOrder = async (req, res) => {
  try {
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
      sendSMS,
    } = req.body;
    const Order = createDynamicModel("Order", organization);
    const OrderGood = createDynamicModel("OrderGood", organization);
    const Client = createDynamicModel("KZClient", organization);
    const Specie = createDynamicModel("Specie", organization);
    const Good = createDynamicModel("Good", organization);
    const Extension = createDynamicModel("Extension", organization);
    const Discount = createDynamicModel("Discount", organization);
    const Delivery = createDynamicModel("Delivery", organization);
    const Workshift = createDynamicModel("Workshift", organization);
    const workshift = await Workshift.findOne({
      attributes: ["id"],
      where: { responsible: userId, close_date: null },
    });
    if (!workshift) {
      return res.status(400).json({ message: "Workshift not found" });
    }
    const workshift_id = workshift.get({ plain: true }).id;
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
        planned_date: moment(started_date)
          .add(renttime, TARIFF_MOMENT_KEYS[tariff])
          .toDate(),
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
      if (sendSMS) {
        const message_id = await sendMessage(
          clientInfo.cellphone,
          `${smsLink}${organization}/${newOrder.id}/${link_code}`
        );
        await Order.update({ message_id }, { where: { id: newOrder.id } });
      }
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
    const {
      page,
      pageSize,
      sortBy,
      sortOrder,
      filter,
      archive,
      firstDate,
      secondDate,
      dateType,
    } = req.query;
    const whereCondition = {
      [Op.and]: [{ for_increment: false }],
    };
    const whereConditionForClient = {};
    if (
      Math.abs(moment(firstDate).diff(moment(secondDate), "days")) >
      MAXIMUM_ARCHIVE_RANGE_DAYS
    ) {
      return res.status(400).json({ message: "Range is too big" });
    }
    if (archive && !(firstDate && secondDate && dateType)) {
      return res
        .status(400)
        .json({ message: "Archive orders are only allowed with DateRange" });
    }
    if (firstDate && secondDate && dateType) {
      whereCondition[Op.and].push({
        [dateType]: { [Op.between]: [firstDate, secondDate] },
      });
    }
    if (filter) {
      if (isNaN(parseInt(filter))) {
        whereConditionForClient[Op.or] = [];
        const everyWord = filter.split(" ");
        const everyWordFiltered = everyWord.filter((i) => i !== "");
        const filterOptions = everyWordFiltered.map((item) => ({
          [Op.like]: `%${item}%`,
        }));
        whereConditionForClient[Op.or].push({ id: { [Op.or]: filterOptions } });
        whereConditionForClient[Op.or].push({
          name: { [Op.or]: filterOptions },
        });
        whereConditionForClient[Op.or].push({
          second_name: { [Op.or]: filterOptions },
        });
        whereConditionForClient[Op.or].push({
          father_name: { [Op.or]: filterOptions },
        });
        whereConditionForClient[Op.or].push({
          paper_person_id: { [Op.or]: filterOptions },
        });
        whereConditionForClient[Op.or].push({
          paper_serial_number: { [Op.or]: filterOptions },
        });
        whereConditionForClient[Op.or].push({
          cellphone: { [Op.or]: filterOptions },
        });
      } else {
        whereCondition[Op.and].push({ id: { [Op.like]: `%${filter}%` } });
      }
    }
    const Order = createDynamicModel(
      archive ? "ArchiveOrder" : "Order",
      organization
    );
    const OrderForCount = createDynamicModel("Order", organization);
    const Delivery = createDynamicModel("Delivery", organization);
    const ArchiveDelivery = createDynamicModel("ArchiveDelivery", organization);
    const Extension = createDynamicModel("Extension", organization);
    const Discount = createDynamicModel("Discount", organization);
    const Client = createDynamicModel("KZClient", organization);
    const OrderGood = createDynamicModel("OrderGood", organization);
    const Payment = createDynamicModel("Payment", organization);
    Order.hasMany(OrderGood, { foreignKey: "order_id", as: "orderGoods" });
    Order.hasMany(Extension, { foreignKey: "order_id", as: "extensions" });
    Order.hasMany(Discount, { foreignKey: "order_id", as: "discounts" });
    Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
    Order.hasMany(Delivery, { foreignKey: "order_id", as: "deliveries" });
    Order.hasMany(ArchiveDelivery, {
      foreignKey: "order_id",
      as: "archiveDeliveries",
    });
    Order.belongsTo(Client, {
      foreignKey: "client",
      as: "clientInfo",
    });
    const orderOptions = [[sortBy, sortOrder]];
    const totalCount = await OrderForCount.count({
      where: { for_increment: false },
    });
    const result = await Order.findAndCountAll({
      attributes: {
        exclude: excludedAttributesOrders,
      },
      where: whereCondition,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          model: Client,
          as: "clientInfo",
          attributes: ["id", "name", "second_name", "father_name"],
          required: true,
          where: whereConditionForClient,
        },
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
          attributes: ["delivery_price_for_customer", "cancelled"],
          required: false,
        },
        {
          model: ArchiveDelivery,
          as: "archiveDeliveries",
          attributes: ["delivery_price_for_customer"],
          required: false,
        },
      ],
      order: orderOptions,
      group: archive
        ? `ArchiveOrder_${organization}.id`
        : `Order_${organization}.id`,
    });
    res.status(200).json({
      orders: result.rows,
      filteredTotalCount: result.count.length,
      totalCount,
    });
  } catch (e) {
    console.log(e.message);
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
    const OrderForCheck = createDynamicModel("Order", organization);
    const orderForCheck = await OrderForCheck.findOne({
      attributes: ["id"],
      where: { id: order_id, for_increment: false },
    });
    const Order = createDynamicModel(
      orderForCheck ? "Order" : "ArchiveOrder",
      organization
    );
    const Delivery = createDynamicModel("Delivery", organization);
    const ArchiveDelivery = createDynamicModel("ArchiveDelivery", organization);
    const Extension = createDynamicModel("Extension", organization);
    const Discount = createDynamicModel("Discount", organization);
    const Payment = createDynamicModel("Payment", organization);
    const OrderGood = createDynamicModel("OrderGood", organization);
    const Specie = createDynamicModel("Specie", organization);
    const Good = createDynamicModel("Good", organization);
    Order.hasMany(OrderGood, { foreignKey: "order_id", as: "orderGoods" });
    Order.hasMany(Extension, { foreignKey: "order_id", as: "extensions" });
    Order.hasMany(Discount, { foreignKey: "order_id", as: "discounts" });
    Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
    Order.hasMany(Delivery, { foreignKey: "order_id", as: "deliveries" });
    Order.hasMany(ArchiveDelivery, {
      foreignKey: "order_id",
      as: "archiveDeliveries",
    });
    Order.belongsTo(Client, { foreignKey: "client", as: "clientInfo" });
    OrderGood.belongsTo(Good, { foreignKey: "good_id", as: "good" });
    OrderGood.belongsTo(Specie, { foreignKey: "specie_id", as: "specie" });
    Extension.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    Payment.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    Discount.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    Delivery.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    ArchiveDelivery.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    const result = await Order.findOne({
      attributes: { exclude: excludedAttributesOrders },
      where: { id: order_id, for_increment: false },
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
        {
          model: ArchiveDelivery,
          as: "archiveDeliveries",
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
    if (result) {
      return res.send(result);
    }
    return res.send({
      notFound: true,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const newPayment = async (req, res) => {
  try {
    const { organization, id: userId } = req.user;
    const {
      order_id,
      amount,
      payment_method_id,
      is_debt = false,
      date,
    } = req.body;
    const Role = createDynamicModel("Role", organization);
    const Debt = createDynamicModel("Debt", organization);
    const OrderForCheck = createDynamicModel("Order", organization);
    const Workshift = createDynamicModel("Workshift", organization);
    const Operation = createDynamicModel("Operation", organization);
    const workshift = await Workshift.findOne({
      attributes: ["id"],
      where: { responsible: userId, close_date: null },
    });
    if (!workshift) {
      return res.status(400).json({ message: "Workshift not found" });
    }
    const workshift_id = workshift.get({ plain: true }).id;
    const orderForCheck = await OrderForCheck.findOne({
      attributes: ["id", "client"],
      where: { id: order_id, for_increment: false },
    });
    if (!orderForCheck) {
      return res.status(400).json({ message: "Order was not found" });
    }
    const orderInfoPlain = orderForCheck.get({ plain: true });
    const roles = await Role.findOne({ where: { user_id: userId } });
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
    if (date) {
      data.verified_date = date;
    } else {
      data.verified_date = new Date();
    }
    if (is_debt) {
      const debt = await Debt.create({
        client_id: orderInfoPlain.client,
        amount: amount,
        order_id: orderInfoPlain.id,
        workshift_id,
        user_id: userId,
      });
      data.debt_id = debt.get({ plain: true }).id;
    }
    await Payment.create(data);
    await Operation.create({
      amount: Math.abs(amount),
      type: "payment",
      positive: amount > 0,
      workshift_id,
      fee: (amount * method_plain.comission) / 100,
      payment_method: method_plain.name,
    });
    res.status(200).json({ message: "New payment created succesfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const newPaymentForCourier = async (req, res) => {
  try {
    const { organization, id: userId } = req.user;
    const { order_id, amount, payment_method_id, delivery_id } = req.body;
    const DeliveryForCheck = createDynamicModel("Delivery", organization);
    const deliveryForCheck = await DeliveryForCheck.findOne({
      attributes: ["id"],
      where: {
        id: delivery_id,
        for_increment: false,
        status: { [Op.or]: ["new", "wfd"] },
      },
    });
    if (!deliveryForCheck) {
      return res.status(400).json({ message: "Delivery was not found" });
    }
    const OrderForCheck = createDynamicModel("Order", organization);
    const Workshift = createDynamicModel("Workshift", organization);
    const workshift = await Workshift.findOne({
      attributes: ["id"],
      where: { responsible: userId, close_date: null },
    });
    if (!workshift) {
      return res.status(400).json({ message: "Workshift not found" });
    }
    const workshift_id = workshift.get({ plain: true }).id;
    const orderForCheck = await OrderForCheck.findOne({
      attributes: ["id", "client"],
      where: { id: order_id, for_increment: false },
    });
    if (!orderForCheck) {
      return res.status(400).json({ message: "Order was not found" });
    }
    const PaymentMethod = createDynamicModel("PaymentMethod", organization);
    const method = await PaymentMethod.findOne({
      where: { id: payment_method_id, courier_access: true },
    });
    if (!method) {
      return res
        .status(400)
        .json({ message: "Payment method with courier access was not found" });
    }
    const method_plain = method.get({ plain: true });
    const Payment = createDynamicModel("Payment", organization);
    const data = {
      order_id,
      amount,
      type: method_plain.name,
      fee: (amount * method_plain.comission) / 100,
      user_id: userId,
      workshift_id,
      delivery_id,
      for_courier: true,
    };
    await Payment.create(data);
    res
      .status(200)
      .json({ message: "New payment for courier created succesfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const newExtension = async (req, res) => {
  try {
    const { organization, id: userId } = req.user;
    const { order_id, renttime, date } = req.body;
    const OrderForCheck = createDynamicModel("Order", organization);
    const orderForCheck = await OrderForCheck.findOne({
      attributes: ["id", "planned_date", "tariff"],
      where: { id: order_id, for_increment: false },
    });
    if (!orderForCheck) {
      return res.status(400).json({ message: "Order was not found" });
    }
    const Workshift = createDynamicModel("Workshift", organization);
    const workshift = await Workshift.findOne({
      attributes: ["id"],
      where: { responsible: userId, close_date: null },
    });
    if (!workshift) {
      return res.status(400).json({ message: "Workshift not found" });
    }
    const workshift_id = workshift.get({ plain: true }).id;
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
    const orderPlain = orderForCheck.get({ plain: true });
    await Extension.create(data);
    await OrderForCheck.update(
      {
        planned_date: moment(orderPlain.planned_date).add(
          renttime,
          TARIFF_MOMENT_KEYS[orderPlain.tariff]
        ),
      },
      { where: { id: order_id } }
    );
    res.status(200).json({ message: "New extension created succesfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const newDiscount = async (req, res) => {
  try {
    const { organization, id: userId } = req.user;
    const { order_id, amount, date, reason } = req.body;
    const OrderForCheck = createDynamicModel("Order", organization);
    const orderForCheck = await OrderForCheck.findOne({
      attributes: ["id"],
      where: { id: order_id, for_increment: false },
    });
    if (!orderForCheck) {
      return res.status(400).json({ message: "Order was not found" });
    }
    const Workshift = createDynamicModel("Workshift", organization);
    const workshift = await Workshift.findOne({
      attributes: ["id"],
      where: { responsible: userId, close_date: null },
    });
    if (!workshift) {
      return res.status(400).json({ message: "Workshift not found" });
    }
    const workshift_id = workshift.get({ plain: true }).id;
    const Discount = createDynamicModel("Discount", organization);
    const data = {
      order_id,
      amount,
      reason,
      user_id: userId,
      workshift_id,
    };
    if (date) {
      data.date = date;
    }
    await Discount.create(data);
    res.status(200).json({ message: "New discount created succesfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const finishOrder = async (req, res) => {
  try {
    const finished_date = new Date();
    const { organization, id: userId } = req.user;
    const { order_id, is_debt } = req.body;
    const Role = createDynamicModel("Role", organization);
    const roles = await Role.findOne({ where: { user_id: userId } });
    if (is_debt) {
      if (!roles.debt) {
        return res
          .status(400)
          .json({ message: "Access denied. You can't create debt payment" });
      }
    }
    const Workshift = createDynamicModel("Workshift", organization);
    const workshift = await Workshift.findOne({
      attributes: ["id"],
      where: { responsible: userId, close_date: null },
    });
    if (!workshift) {
      return res.status(400).json({ message: "Workshift not found" });
    }
    const workshift_id = workshift.get({ plain: true }).id;
    const Order = createDynamicModel("Order", organization);
    const ArchiveOrder = createDynamicModel("ArchiveOrder", organization);
    const Debt = createDynamicModel("Debt", organization);
    const Delivery = createDynamicModel("Delivery", organization);
    const ArchiveDelivery = createDynamicModel("ArchiveDelivery", organization);
    const Discount = createDynamicModel("Discount", organization);
    const Payment = createDynamicModel("Payment", organization);
    const Specie = createDynamicModel("Specie", organization);
    const OrderGood = createDynamicModel("OrderGood", organization);
    Order.hasMany(OrderGood, { foreignKey: "order_id", as: "orderGoods" });
    Order.hasMany(Discount, { foreignKey: "order_id", as: "discounts" });
    Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
    Order.hasMany(Delivery, { foreignKey: "order_id", as: "deliveries" });
    Order.hasMany(ArchiveDelivery, {
      foreignKey: "order_id",
      as: "archiveDeliveries",
    });
    const orderInfo = await Order.findOne({
      where: { id: order_id, for_increment: false },
      include: [
        {
          model: OrderGood,
          as: "orderGoods",
          attributes: ["saved_price", "specie_id"],
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
          attributes: ["amount", "verified"],
          required: false,
        },
        {
          model: Delivery,
          as: "deliveries",
          attributes: ["delivery_price_for_customer", "cancelled"],
          required: false,
        },
        {
          model: ArchiveDelivery,
          as: "archiveDeliveries",
          attributes: ["delivery_price_for_customer"],
          required: false,
        },
      ],
    });
    if (!orderInfo) {
      return res.status(400).json({ message: "Order was not found" });
    }
    const orderInfoPlain = orderInfo.get({ plain: true });
    if (!orderInfoPlain.signed) {
      return res.status(400).json({ message: "Order not signed yet" });
    }
    if (orderInfoPlain.finished_date) {
      return res.status(400).json({ message: "Order was already finished" });
    }
    let goodsSum = 0;
    let deliveriesSum = 0;
    let discountSum = 0;
    let paymentSum = 0;
    const renttime =
      moment(finished_date).diff(
        moment(orderInfoPlain.started_date).add(
          orderInfoPlain.forgive_lateness_ms,
          "milliseconds"
        ),
        TARIFF_MOMENT_KEYS[orderInfoPlain.tariff]
      ) + 1;
    orderInfoPlain.orderGoods.forEach((item) => {
      goodsSum += item.saved_price;
    });
    for (let discount of orderInfoPlain.discounts) {
      discountSum += discount.amount;
    }
    for (let delivery of orderInfoPlain.deliveries) {
      if (delivery.cancelled) continue;
      deliveriesSum += parseInt(delivery.delivery_price_for_customer);
    }
    for (let delivery of orderInfoPlain.archiveDeliveries) {
      if (delivery.cancelled) continue;
      deliveriesSum += parseInt(delivery.delivery_price_for_customer);
    }
    for (let payment of orderInfoPlain.payments) {
      if (payment.verified) {
        paymentSum += payment.amount;
      }
    }
    const total = renttime * goodsSum + deliveriesSum - discountSum;
    const difference = paymentSum - total;
    if (difference < 0) {
      if (!is_debt) {
        return res
          .status(400)
          .json({ message: "Not enough verified payment to finish the order" });
      }
    }
    if (difference !== 0) {
      await Debt.create({
        client_id: orderInfoPlain.client,
        amount: difference,
        order_id: orderInfoPlain.id,
        workshift_id,
        user_id: userId,
      });
    }
    const goods = orderInfoPlain.orderGoods.map((item) => item.specie_id);
    await Specie.update(
      { status: "available", order: null },
      { where: { id: { [Op.in]: goods } } }
    );
    await Order.update({ finished_date }, { where: { id: order_id } });
    const finished_order = await Order.findOne({ where: { id: order_id } });
    await ArchiveOrder.create(finished_order.get({ plain: true }));
    await controlOrdersCount(
      1,
      organization,
      finished_order.get({ plain: true }).client
    );
    await Order.destroy({ where: { id: order_id } });
    await Order.destroy({ where: { for_increment: true } });
    await Order.create({
      id: order_id,
      client: 0,
      author: 0,
      started_date: new Date(),
      planned_date: new Date(),
      workshift_id: 0,
      tariff: "minutely",
      link_code: "x",
      sign_code: "0",
      for_increment: true,
    });
    res.status(200).json({ message: "The order finished succesfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const sendLink = async (req, res) => {
  try {
    const { organization } = req.user;
    const { order_id, link_code } = req.body;
    const Order = createDynamicModel("Order", organization);
    const Client = createDynamicModel("KZClient", organization);
    Order.belongsTo(Client, { foreignKey: "client", as: "clientInfo" });
    const order = await Order.findOne({
      attributes: ["id", "signed", "link_code"],
      where: { id: order_id },
      include: [
        {
          model: Client,
          as: "clientInfo",
          required: true,
          attributes: ["cellphone"],
        },
      ],
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const order_plain = order.get({ plain: true });
    if (order_plain.signed) {
      return res.status(404).json({ message: "Contract already signed" });
    }
    if (order_plain.link_code !== link_code) {
      return res.status(404).json({ message: "Link code is not correct" });
    }
    const message_id = await sendMessage(
      order_plain.clientInfo.cellphone,
      `${smsLink}${organization}/${order_id}/${link_code}`
    );
    await Order.update({ message_id }, { where: { id: order_id } });
    res.status(200).json({ message: "SMS link successfully sent" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const finished_date = new Date();
    const { organization, id: userId } = req.user;
    const { order_id } = req.body;
    const Order = createDynamicModel("Order", organization);
    const Workshift = createDynamicModel("Workshift", organization);
    const workshift = await Workshift.findOne({
      attributes: ["id"],
      where: { responsible: userId, close_date: null },
    });
    if (!workshift) {
      return res.status(400).json({ message: "Workshift not found" });
    }
    const workshift_id = workshift.get({ plain: true }).id;
    const ArchiveOrder = createDynamicModel("ArchiveOrder", organization);
    const Debt = createDynamicModel("Debt", organization);
    const Payment = createDynamicModel("Payment", organization);
    const Specie = createDynamicModel("Specie", organization);
    const OrderGood = createDynamicModel("OrderGood", organization);
    Order.hasMany(OrderGood, { foreignKey: "order_id", as: "orderGoods" });
    Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
    const orderInfo = await Order.findOne({
      where: { id: order_id, for_increment: false },
      include: [
        {
          model: OrderGood,
          as: "orderGoods",
          attributes: ["saved_price", "specie_id"],
          required: false,
        },
        {
          model: Payment,
          as: "payments",
          attributes: ["amount", "verified", "is_debt"],
          required: false,
        },
      ],
    });
    if (!orderInfo) {
      return res.status(400).json({ message: "Order was not found" });
    }
    const orgInfo = await Organization.findOne({
      attributes: ["cancel_time_ms"],
      where: { id: organization },
    });
    if (!orgInfo) {
      return res.status(400).json({ message: "Organization not found" });
    }
    const orderInfoPlain = orderInfo.get({ plain: true });
    const orgInfoPlain = orgInfo.get({ plain: true });
    if (orderInfoPlain.finished_date) {
      return res.status(400).json({ message: "Order was already finished" });
    }
    // if (orderInfoPlain.signed) {
    //   if (
    //     moment(finished_date).diff(
    //       moment(orderInfoPlain.started_date),
    //       "miliseconds"
    //     ) > orgInfoPlain.cancel_time_ms
    //   ) {
    //     return res.status(400).json({ message: "Cancel time is over" });
    //   }
    // }
    let paymentSum = 0;
    for (let payment of orderInfoPlain.payments) {
      if (payment.verified && !payment.is_debt) {
        paymentSum += payment.amount;
      }
    }
    if (paymentSum > 0) {
      await Debt.create({
        client_id: orderInfoPlain.client,
        amount: paymentSum,
        order_id: orderInfoPlain.id,
        workshift_id,
        user_id: userId,
      });
    }
    // res.status(200).json({ message: "The order cancelled succesfully" });
    // return;
    const goods = orderInfoPlain.orderGoods.map((item) => item.specie_id);
    await Specie.update(
      { status: "available", order: null },
      { where: { id: { [Op.in]: goods } } }
    );
    await Order.update(
      { finished_date, cancelled: true },
      { where: { id: order_id } }
    );
    const finished_order = await Order.findOne({ where: { id: order_id } });
    await ArchiveOrder.create(finished_order.get({ plain: true }));
    await Order.destroy({ where: { id: order_id } });
    await Order.destroy({ where: { for_increment: true } });
    await Order.create({
      id: order_id,
      client: 0,
      author: 0,
      started_date: new Date(),
      planned_date: new Date(),
      workshift_id,
      tariff: "minutely",
      link_code: "x",
      sign_code: "0",
      for_increment: true,
    });
    res.status(200).json({ message: "The order cancelled succesfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const signPhysical = async (req, res) => {
  try {
    const { organization } = req.user;
    const { order_id } = req.query;
    const OrderForCheck = createDynamicModel("Order", organization);
    const orderForCheck = await OrderForCheck.findOne({
      attributes: ["id", "signed"],
      where: { id: order_id, for_increment: false },
    });
    if (!orderForCheck) {
      return res.status(400).json({ message: "Order was not found" });
    }
    if (orderForCheck.get({ plain: true }).signed) {
      return res.status(400).json({ message: "Order was already signed" });
    }
    await OrderForCheck.update(
      { signed: true, sign_date: new Date(), sign_type: "physical" },
      { where: { id: order_id, for_increment: false } }
    );
    res.status(200).json({ message: "Order signed succesfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const deleteExtension = async (req, res) => {
  try {
    const { organization } = req.user;
    const { id } = req.query;
    const Extension = createDynamicModel("Extension", organization);
    const Order = createDynamicModel("Order", organization);
    Extension.belongsTo(Order, { foreignKey: "order_id", as: "orderInfo" });
    const info = await Extension.findOne({
      where: { id },
      include: [
        {
          model: Order,
          required: true,
          as: "orderInfo",
          attributes: ["id"],
          where: { for_increment: false },
        },
      ],
    });
    if (!info) {
      return res
        .status(400)
        .json({ message: "Extension not found or in archive" });
    }
    await Extension.destroy({ where: { id } });
    res.status(200).json({ message: "Extension deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { organization } = req.user;
    const { id } = req.query;
    const Payment = createDynamicModel("Payment", organization);
    const Order = createDynamicModel("Order", organization);
    Payment.belongsTo(Order, { foreignKey: "order_id", as: "orderInfo" });
    const info = await Payment.findOne({
      where: { id },
      include: [
        {
          model: Order,
          required: true,
          as: "orderInfo",
          attributes: ["id"],
          where: { for_increment: false },
        },
      ],
    });
    if (!info) {
      return res
        .status(400)
        .json({ message: "Payment not found or in archive" });
    }
    await Payment.destroy({ where: { id } });
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const deleteDiscount = async (req, res) => {
  try {
    const { organization } = req.user;
    const { id } = req.query;
    const Discount = createDynamicModel("Discount", organization);
    const Order = createDynamicModel("Order", organization);
    Discount.belongsTo(Order, { foreignKey: "order_id", as: "orderInfo" });
    const info = await Discount.findOne({
      where: { id },
      include: [
        {
          model: Order,
          required: true,
          as: "orderInfo",
          attributes: ["id"],
          where: { for_increment: false },
        },
      ],
    });
    if (!info) {
      return res
        .status(400)
        .json({ message: "Discount not found or in archive" });
    }
    await Discount.destroy({ where: { id } });
    res.status(200).json({ message: "Discount deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

// 1. id int(10) unsigned auto_increment primary key
// 2. comment varchar(200)
// 3. specie_id int(10) unsigned
// 4. client_id int(10) unsigned not null
// 5. order_id int(10) unsigned
// 6. specie_violation_type ENUM( "broken", "missing")
// 7. date DATETIME not null default CURRENT_TIMESTAMP
// 8. workshift_id int(10) unsigned not null
// 9. user_id int(10) unsigned not null

export const newViolation = async (req, res) => {
  try {
    const { organization, id: userId } = req.user;
    const { comment, order_id, specie_id, specie_violation_type, date } =
      req.body;
    const Order = createDynamicModel("ArchiveOrder", organization);
    const Specie = createDynamicModel("Specie", organization);
    const Violation = createDynamicModel("Violation", organization);
    const OrderGood = createDynamicModel("OrderGood", organization);
    const Workshift = createDynamicModel("Workshift", organization);
    const workshift = await Workshift.findOne({
      attributes: ["id"],
      where: { responsible: userId, close_date: null },
    });
    if (!workshift) {
      return res.status(400).json({ message: "Workshift not found" });
    }
    const workshift_id = workshift.get({ plain: true }).id;
    Order.hasMany(OrderGood, { foreignKey: "order_id", as: "orderGoods" });
    const specieInfo = await Specie.findOne({
      attributes: ["id", "status"],
      where: { id: specie_id },
    });
    if (!specieInfo) {
      return res.status(400).json({ message: "Specie not found" });
    }
    if (specieInfo.get({ plain: true }).status !== "available") {
      return res
        .status(400)
        .json({ message: "Specie status is not available" });
    }
    const orderInfo = await Order.findOne({
      attributes: ["client"],
      where: { id: order_id, for_increment: false },
      include: [
        {
          model: OrderGood,
          attributes: ["specie_id"],
          required: true,
          as: "orderGoods",
        },
      ],
    });
    if (!orderInfo) {
      return res.status(400).json({ message: "Order not found" });
    }
    const orderPlain = orderInfo.get({ plain: true });
    let specieNotFound = true;
    orderPlain.orderGoods.forEach((item) => {
      if (item.specie_id === specie_id) {
        specieNotFound = false;
      }
    });
    if (specieNotFound) {
      return res
        .status(400)
        .json({ message: "Specie not found in this order" });
    }
    const createData = {
      client_id: orderPlain.client,
      user_id: userId,
      workshift_id,
      specie_id,
      order_id,
      specie_violation_type,
    };
    if (comment) {
      createData.comment = comment;
    }
    if (date) {
      createData.date = date;
    }
    await Specie.update(
      { status: specie_violation_type },
      { where: { id: specie_id } }
    );
    await Violation.create(createData);
    res.status(200).json({ message: "Debt created successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};
