import { createDynamicModel } from "../db/db.js";
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
    const Client = createDynamicModel("KZClient", organization);
    const Specie = createDynamicModel("Specie", organization);
    const Good = createDynamicModel("Good", organization);
    const Extension = createDynamicModel("Extension", organization);
    const Discount = createDynamicModel("Discount", organization);
    const Delivery = createDynamicModel("Delivery", organization);
    const OrderGood = createDynamicModel("OrderGood", organization);
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
        });
      if (deliveryThere)
        await Delivery.create({
          ...deliveryThere,
          order_id: newOrder.id,
          workshift_id,
          status: "new",
          direction: "there",
        });
      if (deliveryHere)
        await Delivery.create({
          ...deliveryHere,
          order_id: newOrder.id,
          workshift_id,
          status: "new",
          direction: "here",
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
