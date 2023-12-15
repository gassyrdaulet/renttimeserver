import sequelize, { Organization, User, createDynamicModel } from "../db/db.js";

export const newOrganization = async (req, res) => {
  const orgSeparateTables = [
    "goods",
    "groups_data",
    "orders",
    "roles",
    "species",
    "order_goods",
    "payment_methods",
    "extensions",
    "payments",
    "discounts",
    "kz_clients",
    "exemptions",
    "booking",
    "deliveries",
    "workshifts",
    "operations",
    "delivery_payoffs",
    "debts",
  ];
  try {
    const { id } = req.user;
    const existingUser = (await User.findOne({ where: { id } })).get({
      plain: true,
    });
    const existingOrganization = await Organization.findOne({
      where: { id: existingUser.organization },
    });
    if (existingOrganization) {
      return res.status(400).json({
        message: `You are already in the Organization!`,
        data: { orgId: existingOrganization.getDataValue(id) },
      });
    }
    const newOrganization = (
      await Organization.create({
        owner: id,
        ...req.body,
      })
    ).get({ plain: true });
    const newId = newOrganization.id;
    try {
      await User.update({ organization: newId }, { where: { id } });
      for (let item of orgSeparateTables) {
        await sequelize.query(`CREATE TABLE ${item}_${newId} LIKE ${item}`);
      }
      const Roles = createDynamicModel("Role", newId);
      await Roles.create({ id, admin: true, debt: true });
      const PaymentMethod = createDynamicModel("PaymentMethod", newId);
      await PaymentMethod.create({ comission: 0, name: "Наличные" });
    } catch (e) {
      for (let item of orgSeparateTables) {
        await sequelize.query(`DROP TABLE ${item}_${newId}`);
      }
      await User.update({ organization: null }, { where: { id } });
      await Organization.destroy({ where: { id: newId } });
      console.log(e);
      return res.status(400).json({
        message: "Some error happened while creating a new Organization!",
      });
    }
    return res
      .status(200)
      .json({ message: "New organization created successfully!" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getPaymentMethods = async (req, res) => {
  try {
    const { organization } = req.user;
    const PaymentMethod = createDynamicModel("PaymentMethod", organization);
    const methods = await PaymentMethod.findAll();
    return res.status(200).json({ methods });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};
