import { createDynamicModel, User, Organization } from "../db/db.js";
import { Op } from "sequelize";
import { controlOrdersCount } from "../service/ClientService.js";
import { sendMessage } from "../service/SMSService.js";
import config from "../config/config.json" assert { type: "json" };
import { customAlphabet } from "nanoid";
import moment from "moment";

const { TARIFF_KEYS, TARIFF_MOMENT_KEYS, MAXIMUM_ARCHIVE_RANGE_DAYS } = config;

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
      whereCondition[Op.and].push({ id: { [Op.like]: `%${filter}%` } });
    }
    const orderOptions = [[sortBy, sortOrder]];
    const Order = createDynamicModel(
      archive ? "ArchiveOrder" : "Order",
      organization
    );
    const OrderForCount = createDynamicModel("Order", organization);
    const Delivery = createDynamicModel("Delivery", organization);
    const ArchiveDelivery = createDynamicModel("ArchiveDelivery", organization);
    const Extension = createDynamicModel("Extension", organization);
    const Discount = createDynamicModel("Discount", organization);
    const OrderGood = createDynamicModel("OrderGood", organization);
    const Payment = createDynamicModel("Payment", organization);
    const totalCount = await OrderForCount.count({
      where: { for_increment: false },
    });
    Order.hasMany(OrderGood, { foreignKey: "order_id", as: "orderGoods" });
    Order.hasMany(Extension, { foreignKey: "order_id", as: "extensions" });
    Order.hasMany(Discount, { foreignKey: "order_id", as: "discounts" });
    Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
    Order.hasMany(Delivery, { foreignKey: "order_id", as: "deliveries" });
    Order.hasMany(ArchiveDelivery, {
      foreignKey: "order_id",
      as: "archiveDeliveries",
    });
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
    const workshift_id = 1;
    const { organization, id: userId } = req.user;
    const { order_id, amount, payment_method_id, is_debt, date } = req.body;
    const Role = createDynamicModel("Role", organization);
    const Debt = createDynamicModel("Debt", organization);
    const OrderForCheck = createDynamicModel("Order", organization);
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
        comment: `ID заказа: ${orderInfoPlain.id}. Долг из оплаты.`,
        workshift_id,
        user_id: userId,
      });
      data.debt_id = debt.get({ plain: true }).id;
    }
    await Payment.create(data);
    res.status(200).json({ message: "New payment created succesfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const newPaymentForCourier = async (req, res) => {
  try {
    const workshift_id = 1;
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
    const workshift_id = 1;
    const { organization, id: userId } = req.user;
    const { order_id, renttime, date } = req.body;
    const OrderForCheck = createDynamicModel("Order", organization);
    const orderForCheck = await OrderForCheck.findOne({
      attributes: ["id"],
      where: { id: order_id, for_increment: false },
    });
    if (!orderForCheck) {
      return res.status(400).json({ message: "Order was not found" });
    }
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

export const newDiscount = async (req, res) => {
  try {
    const workshift_id = 1;
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

export const newDelivery = async (req, res) => {
  try {
    const workshift_id = 1;
    const excludedStatuses = ["finished", "status"];
    const { organization, id: userId } = req.user;
    const {
      order_id,
      address,
      cellphone,
      comment,
      direction,
      delivery_price_for_deliver,
      delivery_price_for_customer,
    } = req.body;
    const OrderForCheck = createDynamicModel("Order", organization);
    const orderForCheck = await OrderForCheck.findOne({
      attributes: ["id"],
      where: { id: order_id, for_increment: false },
    });
    if (!orderForCheck) {
      return res.status(400).json({ message: "Order was not found" });
    }
    const Delivery = createDynamicModel("Delivery", organization);
    const existingDelivery = await Delivery.findOne({
      where: { order_id, status: { [Op.notIn]: excludedStatuses }, direction },
    });
    if (existingDelivery) {
      return res
        .status(400)
        .json({ message: "This order already has an active delivery" });
    }
    const data = {
      order_id,
      address,
      user_id: userId,
      cellphone,
      comment,
      direction,
      delivery_price_for_deliver,
      delivery_price_for_customer,
      workshift_id,
      status: "new",
    };
    await Delivery.create(data);
    res.status(200).json({ message: "New extension created succesfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const finishOrder = async (req, res) => {
  try {
    const workshift_id = 1;
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
          attributes: ["saved_price"],
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
        comment: `ID заказа: ${orderInfoPlain.id}. Долг из завершения.`,
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
    await Order.destroy({ where: { id: order_id } });
    await Order.destroy({ where: { for_increment: true } });
    await Order.create({
      id: order_id,
      client: 0,
      author: 0,
      started_date: new Date(),
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

export const cancelOrder = async (req, res) => {
  try {
    const workshift_id = 1;
    const finished_date = new Date();
    const { organization, id: userId } = req.user;
    const { order_id } = req.body;
    const Order = createDynamicModel("Order", organization);
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
          attributes: ["amount"],
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
    if (orderInfoPlain.signed) {
      if (
        moment(finished_date).diff(
          moment(orderInfoPlain.started_date),
          "miliseconds"
        ) > orgInfoPlain
      ) {
        return res.status(400).json({ message: "Cancel time is over" });
      }
    }
    let paymentSum = 0;
    for (let payment of orderInfoPlain.payments) {
      paymentSum += payment.amount;
    }
    if (paymentSum > 0) {
      await Debt.create({
        client_id: orderInfoPlain.client,
        amount: paymentSum,
        comment: `ID заказа: ${orderInfoPlain.id}. Долг из отмены.`,
        workshift_id,
        user_id: userId,
      });
    }
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
