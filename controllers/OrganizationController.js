import sequelize, { Organization, User, createDynamicModel } from "../db/db.js";

export const newOrganization = async (req, res) => {
  const orgSeparateTables = [
    "goods",
    "groups_data",
    "orders",
    "archive_orders",
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
    "archive_deliveries",
    "workshifts",
    "operations",
    "delivery_payoffs",
    "debts",
    "violations",
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
      await Roles.create({
        user_id: id,
        owner: true,
        courier: true,
        manager: true,
        admin: true,
        debt: true,
      });
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
    const { courier_access } = req.query;
    const PaymentMethod = createDynamicModel("PaymentMethod", organization);
    const whereCondition = {};
    if (courier_access) {
      whereCondition.where = { courier_access };
    }
    const methods = await PaymentMethod.findAll(whereCondition);
    return res.status(200).json({ methods });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { organization } = req.user;
    const { role } = req.query;
    const Role = createDynamicModel("Role", organization);
    Role.belongsTo(User, { foreignKey: "user_id", as: "userInfo" });
    const whereCondition = {};
    if (role) {
      whereCondition[role] = true;
    }
    const users = await Role.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "userInfo",
          attributes: { exclude: ["organization"] },
          required: true,
        },
      ],
    });
    return res.status(200).json({ users });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const addNewUser = async (req, res) => {
  try {
    const { organization } = req.user;
    const { roles, user_id } = req.body;
    const Role = createDynamicModel("Role", organization);
    const userInfo = await User.findOne({ where: { id: user_id } });
    if (!userInfo) {
      return res.status(400).json({ message: "User not found" });
    }
    const userInfoPlain = userInfo.get({ plain: true });
    if (userInfoPlain.organization) {
      return res
        .status(400)
        .json({ message: "User is already in another organization" });
    }
    await User.update({ organization }, { where: { id: user_id } });
    await Role.create({
      user_id,
      ...roles,
    });
    return res.status(200).json({ message: "New user added successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { organization } = req.user;
    const { user_id } = req.query;
    const Role = createDynamicModel("Role", organization);
    const userInfo = await User.findOne({
      where: { id: user_id, organization },
    });
    if (!userInfo) {
      return res.status(400).json({ message: "User not found" });
    }
    const userInfoPlain = userInfo.get({ plain: true });
    if (!userInfoPlain) {
      return res.status(400).json({ message: "User is not in organization" });
    }
    if (!userInfoPlain.organization) {
      return res.status(400).json({ message: "User is not in organization" });
    }
    const roleInfo = await Role.findOne({ where: { user_id } });
    const rolePlain = roleInfo.get({ plain: true });
    if (rolePlain.owner) {
      return res
        .status(400)
        .json({ message: "Owner can not be deleted from organization" });
    }
    await User.update({ organization: null }, { where: { id: user_id } });
    await Role.destroy({
      where: { user_id },
    });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const grantPrivilege = async (req, res) => {
  try {
    const { organization } = req.user;
    const { privilege, user_id } = req.body;
    const Role = createDynamicModel("Role", organization);
    const userInfo = await User.findOne({ where: { id: user_id } });
    if (!userInfo) {
      return res.status(400).json({ message: "User not found" });
    }
    const userInfoPlain = userInfo.get({ plain: true });
    if (userInfoPlain.organization !== organization) {
      return res
        .status(400)
        .json({ message: "User is in another organization" });
    }
    await Role.update(
      {
        [privilege]: sequelize.literal(`NOT ${privilege}`),
      },
      { where: { id: user_id } }
    );
    return res.status(200).json({ message: "User edited successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const changeMethodOption = async (req, res) => {
  try {
    const { organization } = req.user;
    const { option, method_id } = req.body;
    const PaymentMethod = createDynamicModel("PaymentMethod", organization);
    const methodInfo = await PaymentMethod.findOne({
      where: { id: method_id },
    });
    if (!methodInfo) {
      return res.status(400).json({ message: "Method not found" });
    }
    await PaymentMethod.update(
      {
        [option]: sequelize.literal(`NOT ${option}`),
      },
      { where: { id: method_id } }
    );
    return res
      .status(200)
      .json({ message: "Method option edited successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const editMethod = async (req, res) => {
  try {
    const { organization } = req.user;
    const { name, method_id, comission } = req.body;
    const PaymentMethod = createDynamicModel("PaymentMethod", organization);
    const methodInfo = await PaymentMethod.findOne({
      where: { id: method_id },
    });
    if (!methodInfo) {
      return res.status(400).json({ message: "Method not found" });
    }
    await PaymentMethod.update(
      {
        name,
        comission,
      },
      { where: { id: method_id } }
    );
    return res.status(200).json({ message: "Method edited successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const deleteMethod = async (req, res) => {
  try {
    const { organization } = req.user;
    const { method_id } = req.query;
    const PaymentMethod = createDynamicModel("PaymentMethod", organization);
    const methodInfo = await PaymentMethod.findOne({
      where: { id: method_id },
    });
    if (!methodInfo) {
      return res.status(400).json({ message: "Method not found" });
    }
    await PaymentMethod.destroy({ where: { id: method_id } });
    return res.status(200).json({ message: "Method deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const createNewMethod = async (req, res) => {
  try {
    const { organization } = req.user;
    const { name, comission, courier_access } = req.body;
    const PaymentMethod = createDynamicModel("PaymentMethod", organization);
    await PaymentMethod.create({ name, comission, courier_access });
    return res.status(200).json({ message: "Method created successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};
