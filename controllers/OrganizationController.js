import sequelize, { Organization, User, createDynamicModel } from "../db/db.js";
import config from "../config/config.json" assert { type: "json" };
import { Op } from "sequelize";
import moment from "moment";

const { MAXIMUM_ARCHIVE_RANGE_DAYS } = config;

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

export const newWorkshift = async (req, res) => {
  try {
    const { organization, id: userId } = req.user;
    const Workshift = createDynamicModel("Workshift", organization);
    const alreadyOpened = await Workshift.findOne({
      attributes: ["id"],
      where: { close_date: null },
    });
    if (alreadyOpened) {
      return res.status(400).json({ message: "Open workshift already exists" });
    }
    await Workshift.create({ responsible: userId });
    res.status(200).json({ message: "New workshift opened successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const closeWorkshift = async (req, res) => {
  try {
    const { organization, id: userId } = req.user;
    const { workshift_id } = req.body;
    const Role = createDynamicModel("Role", organization);
    const roles = (await Role.findOne({ where: { user_id: userId } })).get({
      plain: true,
    });
    const Workshift = createDynamicModel("Workshift", organization);
    const workshiftInfo = await Workshift.findOne({
      attributes: ["id"],
      where: { id: workshift_id, close_date: null },
    });
    if (!workshiftInfo) {
      return res.status(400).json({ message: "Workshift was not found" });
    }
    const workshiftPlain = workshiftInfo.get({ plain: true });
    if (workshiftPlain.responsible !== userId) {
      if (!roles.owner) {
        return res
          .status(401)
          .json({ message: "Can not close this workshift" });
      }
    }
    await Workshift.update(
      { close_date: new Date() },
      { where: { id: workshift_id } }
    );
    res.status(200).json({ message: "Workshift closed successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const controlWorkshift = async (req, res) => {
  try {
    const { organization, id: userId } = req.user;
    const { amount, positive, workshift_id, payment_method_id } = req.body;
    const Role = createDynamicModel("Role", organization);
    const Operation = createDynamicModel("Operation", organization);
    const Workshift = createDynamicModel("Workshift", organization);
    const PaymentMethod = createDynamicModel("PaymentMethod", organization);
    const roles = (await Role.findOne({ where: { user_id: userId } })).get({
      plain: true,
    });
    const paymentMethodInfo = await PaymentMethod.findOne({
      where: { id: payment_method_id },
    });
    if (!paymentMethodInfo) {
      return res.status(400).json({ message: "Payment method was not found" });
    }
    const paymentMethodPlain = paymentMethodInfo.get({ plain: true });
    const workshiftInfo = await Workshift.findOne({
      attributes: ["id"],
      where: { id: workshift_id, close_date: null },
    });
    if (!workshiftInfo) {
      return res.status(400).json({ message: "Workshift was not found" });
    }
    const workshiftPlain = workshiftInfo.get({ plain: true });
    if (workshiftPlain.responsible !== userId) {
      if (!roles.owner) {
        return res
          .status(401)
          .json({ message: "Can not control cash of this workshift" });
      }
    }
    await Operation.create({
      amount,
      positive,
      type: "control",
      workshift_id,
      payment_method: paymentMethodPlain.name,
      fee: (amount * paymentMethodPlain.comission) / 100,
    });
    res.status(200).json({ message: "Control successfully registered" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getWorkshift = async (req, res) => {
  try {
    const { organization, id: userId } = req.user;
    const { workshift_id } = req.query;
    const whereCondition = {};
    if (workshift_id) {
      whereCondition.id = workshift_id;
    } else {
      whereCondition.responsible = userId;
      whereCondition.close_date = null;
    }
    const Workshift = createDynamicModel("Workshift", organization);
    const Order = createDynamicModel("Order", organization);
    const ArchiveOrder = createDynamicModel("ArchiveOrder", organization);
    const Extension = createDynamicModel("Extension", organization);
    const Discount = createDynamicModel("Discount", organization);
    const Debt = createDynamicModel("Debt", organization);
    const DeliveryPayoff = createDynamicModel("DeliveryPayoff", organization);
    const Violation = createDynamicModel("Violation", organization);
    const Operation = createDynamicModel("Operation", organization);
    Workshift.belongsTo(User, { foreignKey: "responsible", as: "userInfo" });
    const workshift = await Workshift.findOne({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "userInfo",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!workshift) {
      return res
        .status(200)
        .json({ close_date: new Date(), message: "Workshift not found" });
    }
    const workshiftPlain = workshift.get({ plain: true });

    if (workshift_id) {
      const operations = await Operation.findAll({
        where: { workshift_id },
        attributes: [
          "id",
          "amount",
          "date",
          "type",
          "positive",
          "payment_method",
          "fee",
        ],
      });
      const extensions = await Extension.findAll({
        where: { workshift_id },
        attributes: ["id"],
      });
      const orders = await Order.findAll({
        where: { workshift_id },
        attributes: ["id"],
      });
      const archiveOrders = await ArchiveOrder.findAll({
        where: { workshift_id },
        attributes: ["id"],
      });
      const violations = await Violation.findAll({
        where: { workshift_id },
        attributes: [
          "id",
          "specie_id",
          "comment",
          "date",
          "client_id",
          "order_id",
          "specie_violation_type",
        ],
      });
      const deliveryPayoffs = await DeliveryPayoff.findAll({
        where: { workshift_id },
        attributes: ["id", "courier_id", "comment", "date"],
      });
      const discounts = await Discount.findAll({
        where: { workshift_id },
        attributes: ["id", "amount", "reason", "date", "order_id"],
      });
      const debts = await Debt.findAll({
        where: { workshift_id },
        attributes: [
          "id",
          "client_id",
          "amount",
          "comment",
          "date",
          "closed",
          "order_id",
        ],
      });
      workshiftPlain.orders = orders;
      workshiftPlain.archiveOrders = archiveOrders;
      workshiftPlain.violations = violations;
      workshiftPlain.extensions = extensions;
      workshiftPlain.operations = operations;
      workshiftPlain.deliveryPayoffs = deliveryPayoffs;
      workshiftPlain.debts = discounts;
      workshiftPlain.debts = debts;
    }

    res.status(200).json(workshiftPlain);
  } catch (e) {
    console.log(e?.message);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getWorkshifts = async (req, res) => {
  try {
    const { organization } = req.user;
    const {
      page,
      pageSize,
      sortBy,
      sortOrder,
      firstDate,
      secondDate,
      dateType,
      filter,
    } = req.query;
    const whereCondition = {};
    if (filter) {
      whereCondition[Op.or] = [{ id: { [Op.like]: `%${filter}%` } }];
    }
    if (
      Math.abs(moment(firstDate).diff(moment(secondDate), "days")) >
      MAXIMUM_ARCHIVE_RANGE_DAYS
    ) {
      return res.status(400).json({ message: "Range is too big" });
    }
    if (firstDate && secondDate && dateType) {
      whereCondition[Op.and] = [];
      whereCondition[Op.and].push({
        [dateType]: { [Op.between]: [firstDate, secondDate] },
      });
    }
    const orderOptions = [[sortBy, sortOrder]];
    const Workshift = createDynamicModel("Workshift", organization);
    const Operation = createDynamicModel("Operation", organization);
    Workshift.belongsTo(User, { foreignKey: "responsible", as: "userInfo" });
    Workshift.hasMany(Operation, {
      foreignKey: "workshift_id",
      as: "operations",
    });
    const result = await Workshift.findAndCountAll({
      where: whereCondition,
      order: orderOptions,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          model: User,
          as: "userInfo",
          attributes: ["id", "name"],
          required: true,
        },
        {
          model: Operation,
          as: "operations",
        },
      ],
      group: `Workshift_${organization}.id`,
    });
    res.status(200).json({
      workshifts: result.rows,
      filteredTotalCount: result.count.length,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const editOrganization = async (req, res) => {
  try {
    const { organization } = req.user;
    const {
      name,
      address,
      start_work,
      end_work,
      region,
      city,
      back_company_type,
      company_type,
      bank_company_name,
      company_name,
      kz_paper_bik,
      kz_paper_bin,
      kz_paper_iik,
      cancel_time_ms = 0,
    } = req.body;
    const orgInfo = await Organization.findOne({
      where: { id: organization },
    });
    if (!orgInfo) {
      return res.status(400).json({ message: "Organization not found" });
    }
    await Organization.update(
      {
        name,
        address,
        start_work,
        end_work,
        region,
        city,
        back_company_type,
        company_type,
        bank_company_name,
        company_name,
        kz_paper_bik,
        kz_paper_bin,
        kz_paper_iik,
        cancel_time_ms,
      },
      { where: { id: organization } }
    );
    return res
      .status(200)
      .json({ message: "Organization edited successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const getOrganization = async (req, res) => {
  try {
    const { organization } = req.user;
    const orgInfo = await Organization.findOne({
      where: { id: organization },
    });
    if (!orgInfo) {
      return res.status(400).json({ message: "Organization not found" });
    }
    return res.send(orgInfo.get({ plain: true }));
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unknown internal error" });
  }
};
