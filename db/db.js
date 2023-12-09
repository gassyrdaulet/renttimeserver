import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";
import initOrganization from "./Organization.js";
import initUser from "./User.js";
import initKZBadClient from "./KZBadClient.js";
import initRole from "./Role.js";
import initGood from "./Good.js";
import initSpecie from "./Specie.js";
import initGroup from "./Group.js";
import initOrder from "./Order.js";
import initOrderGood from "./OrderGood.js";
import initPayment from "./Payment.js";
import initPaymentMethod from "./PaymentMethod.js";
import initExtension from "./Extension.js";
import initDiscount from "./Discount.js";
import initDebt from "./Debt.js";
import initBooking from "./Booking.js";
import initKZClient from "./KZClient.js";
import initDeliveryPayoff from "./DeliveryPayoff.js";
import initDelivery from "./Delivery.js";
import initExemption from "./Exemption.js";
import initOperation from "./Operation.js";
import initWorkshift from "./Workshift.js";

dotenv.config();
const isProduction = process.env?.PRODUCTION === "true";
const remoteHost = "138.68.68.74";
const localHost = "127.0.0.1";
const dbConfig = {
  database_name: "renttime",
  user: "server",
  password: "Fasicani@tion200#",
};
const { database_name, user, password } = dbConfig;

const sequelize = new Sequelize(database_name, user, password, {
  logging: false,
  host: isProduction ? localHost : remoteHost,
  dialect: "mysql",
});

export const Organization = initOrganization(sequelize);
export const User = initUser(sequelize);
export const KZBadClient = initKZBadClient(sequelize);
initRole(sequelize);
initGood(sequelize);
initGroup(sequelize);
initSpecie(sequelize);
initOrder(sequelize);
initOrderGood(sequelize);
initPayment(sequelize);
initPaymentMethod(sequelize);
initExtension(sequelize);
initDiscount(sequelize);
initDebt(sequelize);
initOperation(sequelize);
initExemption(sequelize);
initBooking(sequelize);
initWorkshift(sequelize);
initDelivery(sequelize);
initDeliveryPayoff(sequelize);
initKZClient(sequelize);

export default sequelize;

export function createDynamicModel(baseModelName, id) {
  try {
    const BaseModel = sequelize.models[baseModelName];
    if (BaseModel) {
      const dynamicTableName = `${BaseModel.getTableName()}_${id}`;
      const dynamicModelName = `${baseModelName}_${id}`;
      const DynamicModel = sequelize.define(
        dynamicModelName,
        BaseModel.getAttributes(),
        {
          modelName: dynamicModelName,
          sequelize,
          tableName: dynamicTableName,
          timestamps: false,
        }
      );
      sequelize.modelManager.removeModel(DynamicModel);
      return DynamicModel;
    } else {
      throw new Error("Model was not found");
    }
  } catch (e) {
    throw new Error(e?.message ? e.message : "Create dynamic table Error");
  }
}
