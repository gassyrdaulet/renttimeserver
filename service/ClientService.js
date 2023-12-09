import { createDynamicModel } from "../db/db.js";

export const controlOrdersCount = async (amount, organization, clientId) => {
  try {
    const Client = createDynamicModel("KZClient", organization);
    const clientInfo = (await Client.findOne({ where: { id: clientId } })).get({
      plain: true,
    });
    const { orders_count } = clientInfo;
    await Client.update(
      { orders_count: orders_count ? orders_count + amount : 1 },
      { where: { id: clientId } }
    );
  } catch (e) {
    throw new Error("Client orders count control fail");
  }
};
