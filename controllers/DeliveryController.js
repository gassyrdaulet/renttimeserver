import { createDynamicModel, User } from "../db/db.js";
import { Op } from "sequelize";
import config from "../config/config.json" assert { type: "json" };
import moment from "moment";

const { MAXIMUM_ARCHIVE_RANGE_DAYS } = config;

export const getDeliveryDetails = async (req, res) => {
  try {
    const excludedAttributesOrders = ["for_increment"];
    const { organization } = req.user;
    const { delivery_id } = req.query;
    const DeliveryForCheck = createDynamicModel("Delivery", organization);
    const deliveryForCheck = await DeliveryForCheck.findOne({
      attributes: ["id", "order_id"],
      where: { id: delivery_id, for_increment: false },
    });
    const ArchievDeliveryForCheck = createDynamicModel(
      "ArchiveDelivery",
      organization
    );
    const archiveDeliveryForCheck = await ArchievDeliveryForCheck.findOne({
      attributes: ["id", "order_id"],
      where: { id: delivery_id, for_increment: false },
    });
    if (!deliveryForCheck && !archiveDeliveryForCheck) {
      return res.send({
        notFound: true,
      });
    }
    const Delivery = createDynamicModel(
      deliveryForCheck ? "Delivery" : "ArchiveDelivery",
      organization
    );
    const OrderForCheck = createDynamicModel("Order", organization);
    const orderForCheck = await OrderForCheck.findOne({
      attributes: ["id"],
      where: {
        id: deliveryForCheck
          ? deliveryForCheck.order_id
          : archiveDeliveryForCheck.order_id,
        for_increment: false,
      },
    });
    const Order = createDynamicModel(
      orderForCheck ? "Order" : "ArchiveOrder",
      organization
    );
    const OrderGood = createDynamicModel("OrderGood", organization);
    const Payment = createDynamicModel("Payment", organization);
    const Specie = createDynamicModel("Specie", organization);
    const Good = createDynamicModel("Good", organization);
    Order.hasMany(OrderGood, { foreignKey: "order_id", as: "orderGoods" });
    Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
    OrderGood.belongsTo(Good, { foreignKey: "good_id", as: "good" });
    OrderGood.belongsTo(Specie, { foreignKey: "specie_id", as: "specie" });
    Delivery.belongsTo(User, { foreignKey: "courier_id", as: "courier" });
    Delivery.belongsTo(User, { foreignKey: "user_id", as: "author" });
    Delivery.belongsTo(Order, { foreignKey: "order_id", as: "orderInfo" });
    const result = await Delivery.findOne({
      attributes: { exclude: excludedAttributesOrders },
      where: { id: delivery_id, for_increment: false },
      include: [
        {
          model: Order,
          as: "orderInfo",
          attributes: ["id", "finished_date", "tariff"],
          include: [
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
              model: Payment,
              as: "payments",
              attributes: ["id", "amount", "type"],
              where: { for_courier: true, delivery_id },
              required: false,
            },
          ],
        },
        {
          model: User,
          as: "courier",
          attributes: ["name", "id", "cellphone"],
          required: false,
        },
        {
          model: User,
          as: "author",
          attributes: ["name", "id", "cellphone"],
          required: false,
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

export const getDeliveries = async (req, res) => {
  try {
    const excludedAttributesOrders = [
      "cellphone",
      "for_increment",
      "workshift_id",
      "payoff_id",
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
      status,
      courier_id,
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
      return res.status(400).json({
        message: "Archive deliveries are only allowed with Date Range",
      });
    }
    if (firstDate && secondDate && dateType) {
      whereCondition[Op.and].push({
        [dateType]: { [Op.between]: [firstDate, secondDate] },
      });
    }
    if (filter) {
      whereCondition[Op.and].push({ id: { [Op.like]: `%${filter}%` } });
    }
    if (!archive) {
      whereCondition[Op.and].push({ status });
    }
    if (courier_id) {
      whereCondition[Op.and].push({ courier_id });
    }
    const orderOptions = [[sortBy, sortOrder]];
    const Delivery = createDynamicModel(
      archive ? "ArchiveDelivery" : "Delivery",
      organization
    );
    const DeliveryForCount = createDynamicModel("Delivery", organization);
    const totalCount = {};
    totalCount.new = await DeliveryForCount.count({
      where: { for_increment: false, status: "new" },
    });
    totalCount.wfd = await DeliveryForCount.count({
      where: { for_increment: false, status: "wfd" },
    });
    totalCount.processing = await DeliveryForCount.count({
      where: { for_increment: false, status: "processing" },
    });
    const Order = createDynamicModel("Order", organization);
    const ArchiveOrder = createDynamicModel("ArchiveOrder", organization);
    const Payment = createDynamicModel("Payment", organization);
    const Good = createDynamicModel("Good", organization);
    const Specie = createDynamicModel("Specie", organization);
    const OrderGood = createDynamicModel("OrderGood", organization);
    Delivery.belongsTo(Order, { foreignKey: "order_id", as: "orderInfo" });
    Delivery.belongsTo(ArchiveOrder, {
      foreignKey: "order_id",
      as: "archiveOrderInfo",
    });
    Delivery.hasMany(Payment, { foreignKey: "delivery_id", as: "payments" });
    Order.hasMany(OrderGood, { foreignKey: "order_id", as: "orderGoods" });
    ArchiveOrder.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
    ArchiveOrder.hasMany(OrderGood, {
      foreignKey: "order_id",
      as: "orderGoods",
    });
    Delivery.belongsTo(User, { foreignKey: "courier_id", as: "courier" });
    Delivery.belongsTo(User, { foreignKey: "user_id", as: "author" });
    OrderGood.belongsTo(Good, { foreignKey: "good_id", as: "good" });
    OrderGood.belongsTo(Specie, { foreignKey: "specie_id", as: "specie" });
    const result = await Delivery.findAndCountAll({
      attributes: { exclude: excludedAttributesOrders },
      where: whereCondition,
      order: orderOptions,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          model: User,
          as: "courier",
          attributes: ["name", "id", "cellphone"],
          required: false,
        },
        {
          model: User,
          as: "author",
          attributes: ["name", "id", "cellphone"],
          required: false,
        },
        {
          model: Payment,
          as: "payments",
          attributes: ["id", "amount", "type"],
          where: { for_courier: true },
          required: false,
        },
        {
          model: ArchiveOrder,
          as: "archiveOrderInfo",
          attributes: ["id"],
          required: false,
          include: [
            {
              model: OrderGood,
              as: "orderGoods",
              required: false,
              attributes: ["saved_price"],
              include: [
                {
                  model: Good,
                  as: "good",
                  required: false,
                  attributes: ["name", "id"],
                },
                {
                  model: Specie,
                  as: "specie",
                  required: false,
                  attributes: ["code", "id"],
                },
              ],
            },
          ],
        },
        {
          model: Order,
          as: "orderInfo",
          required: false,
          include: [
            {
              model: OrderGood,
              as: "orderGoods",
              attributes: ["saved_price"],
              required: false,
              include: [
                {
                  model: Good,
                  as: "good",
                  required: false,
                  attributes: ["name"],
                },
                {
                  model: Specie,
                  as: "specie",
                  required: false,
                  attributes: ["code", "id"],
                },
              ],
            },
          ],
        },
      ],
      group: archive
        ? `ArchiveDelivery_${organization}.id`
        : `Delivery_${organization}.id`,
    });
    res.status(200).json({
      deliveries: result.rows,
      filteredTotalCount: result.count.length,
      totalCount,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const sendCourier = async (req, res) => {
  try {
    const { organization } = req.user;
    const { deliveries, courier_id } = req.body;
    const now = new Date();
    const courier = await User.findOne({ where: { id: courier_id } });
    if (!courier) {
      return res.status(400).json({ message: "Courier not found" });
    }
    const Role = createDynamicModel("Role", organization);
    const roles = await Role.findOne({ where: { user_id: courier_id } });
    if (!roles) {
      return res
        .status(400)
        .json({ message: "User is not in this organization" });
    }
    const rolesPlain = roles.get({ plain: true });
    if (!rolesPlain.courier) {
      return res.status(400).json({ message: "User is not courier" });
    }
    const Delivery = createDynamicModel("Delivery", organization);
    const updateInfo = await Delivery.update(
      {
        courier_id,
        status: "wfd",
        went_date: now,
      },
      {
        where: {
          id: {
            [Op.in]: deliveries.map((item) => item.delivery_id),
          },
          status: "new",
          for_increment: false,
        },
      }
    );
    res.status(200).json({
      message: "Deliveries successfully sent",
      totalSuccess: updateInfo[0],
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const issueDelivery = async (req, res) => {
  try {
    const { organization, id: userId } = req.user;
    const { delivery_id } = req.query;
    const now = new Date();
    const Role = createDynamicModel("Role", organization);
    const roles = await Role.findOne({ where: { user_id: userId } });
    if (!roles) {
      return res
        .status(400)
        .json({ message: "User is not in this organization" });
    }
    const rolesPlain = roles.get({ plain: true });
    if (!rolesPlain.courier) {
      return res.status(400).json({ message: "User is not courier" });
    }
    const Delivery = createDynamicModel("Delivery", organization);
    const deliveryInfo = await Delivery.findOne({ where: { id: delivery_id } });
    if (!deliveryInfo) {
      return res.status(400).json({ message: "Order not found" });
    }
    const deliveryInfoPlain = deliveryInfo.get({ plain: true });
    if (userId !== deliveryInfoPlain.courier_id) {
      return res
        .status(400)
        .json({ message: "You are not the courier of this delivery" });
    }
    if (deliveryInfoPlain.status !== "wfd") {
      return res
        .status(400)
        .json({ message: "Inappropriate status for issuing" });
    }
    await Delivery.update(
      {
        status: "processing",
        delivered_date: now,
      },
      {
        where: {
          id: delivery_id,
          status: "wfd",
          for_increment: false,
        },
      }
    );
    res.status(200).json({
      message: "Delivery successfully issued",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const refuseDelivery = async (req, res) => {
  try {
    const fieldsToRemove = [
      "id",
      "created_date",
      "went_date",
      "delivered_date",
      "finished_date",
      "courier_id",
      "status",
      "payoff_id",
      "for_increment",
    ];
    const { organization, id: userId } = req.user;
    const { delivery_id } = req.query;
    const now = new Date();
    const Role = createDynamicModel("Role", organization);
    const roles = await Role.findOne({ where: { user_id: userId } });
    if (!roles) {
      return res
        .status(400)
        .json({ message: "User is not in this organization" });
    }
    const rolesPlain = roles.get({ plain: true });
    if (!rolesPlain.courier) {
      return res.status(400).json({ message: "User is not courier" });
    }
    const Delivery = createDynamicModel("Delivery", organization);
    const deliveryInfo = await Delivery.findOne({ where: { id: delivery_id } });
    if (!deliveryInfo) {
      return res.status(400).json({ message: "Order not found" });
    }
    const deliveryInfoPlain = deliveryInfo.get({ plain: true });
    if (userId !== deliveryInfoPlain.courier_id) {
      return res
        .status(400)
        .json({ message: "You are not the courier of this delivery" });
    }
    if (deliveryInfoPlain.status !== "wfd") {
      return res
        .status(400)
        .json({ message: "Inappropriate status for cancelling" });
    }
    await Delivery.update(
      {
        status: "processing",
        delivered_date: now,
        cancelled: true,
      },
      {
        where: {
          id: delivery_id,
          status: "wfd",
          for_increment: false,
        },
      }
    );
    for (let field of fieldsToRemove) delete deliveryInfoPlain[field];
    await Delivery.create({
      ...deliveryInfoPlain,
      status: "new",
    });
    await res.status(200).json({
      message: "Delivery successfully refused",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const finishDeliveries = async (req, res) => {
  try {
    const workshift_id = 1;
    const fieldsToRemove = [
      "status",
      "payoff_id",
      "for_increment",
      "delivery_price_for_deliver",
    ];
    const { organization } = req.user;
    const { deliveries, comment } = req.body;
    const now = new Date();
    const Delivery = createDynamicModel("Delivery", organization);
    const Payment = createDynamicModel("Payment", organization);
    const ArchiveDelivery = createDynamicModel("ArchiveDelivery", organization);
    const DeliveryPayoff = createDynamicModel("DeliveryPayoff", organization);
    let succeeded = 0;
    const fetchedDeliveries = await Delivery.findAll({
      where: {
        for_increment: false,
        id: { [Op.in]: deliveries.map((item) => item.delivery_id) },
      },
    });
    let filteredDeliveries = [...deliveries];
    for (let delivery of fetchedDeliveries) {
      filteredDeliveries = filteredDeliveries.filter(
        (item) => parseInt(item.delivery_id) !== delivery.id
      );
      if (delivery.courier_id !== fetchedDeliveries[0].courier_id) {
        return res
          .status(400)
          .json({ message: "Deliveries must have same courier" });
      }
      if (delivery.status !== "processing") {
        return res.status(400).json({
          message: "Deliveries should statuses must be processing",
        });
      }
    }
    if (filteredDeliveries.length !== 0) {
      return res.status(400).json({
        message: `Deliveries not found!`,
      });
    }
    const payoffInfo = await DeliveryPayoff.create({
      comment,
      courier_id: fetchedDeliveries[0].courier_id,
    });
    await Promise.all(
      fetchedDeliveries.map(async (delivery) => {
        for (let field of fieldsToRemove) delete delivery[field];
        let delivery_price_for_deliver = 0;
        for (let item of deliveries) {
          if (item.id === delivery.id) {
            delivery_price_for_deliver = item.delivery_price_for_deliver;
          }
        }
        await ArchiveDelivery.create({
          ...delivery.get({ plain: true }),
          status: "finished",
          finished_date: now,
          delivery_price_for_deliver,
          payoff_id: payoffInfo.get({ plain: true }).id,
        });
        await Delivery.destroy({ where: { id: delivery.id } });
        await Delivery.destroy({ where: { for_increment: true } });
        await Delivery.create({
          id: delivery.id,
          for_increment: true,
          address: "x",
          cellphone: "0",
          order_id: 0,
          workshift_id,
          status: "new",
          direction: "there",
          delivery_price_for_deliver: 0,
          delivery_price_for_customer: 0,
          user_id: 0,
        });
        await Payment.update(
          { verified: true, verified_date: now },
          { where: { delivery_id: delivery.id } }
        );
        succeeded++;
      })
    );
    await res.status(200).json({
      message: "Deliveries successfully finished",
      totalSuccess: succeeded,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};
