import { DataTypes, Model } from "sequelize";

const initOrder = (sequelize) => {
  class Order extends Model {}

  Order.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      client: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      author: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      comment: {
        type: DataTypes.STRING(500),
      },
      link_code: {
        type: DataTypes.STRING(8),
        allowNull: false,
      },
      sign_code: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      message_id: {
        type: DataTypes.STRING(20),
      },
      created_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      started_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      planned_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      finished_date: {
        type: DataTypes.DATE,
      },
      sign_date: {
        type: DataTypes.DATE,
      },
      last_sign_sms: {
        type: DataTypes.DATE,
      },
      for_increment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      forgive_lateness_ms: {
        type: DataTypes.INTEGER(15),
        unsigned: true,
        defaultValue: 0,
      },
      workshift_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      tariff: {
        type: DataTypes.ENUM("monthly", "daily", "hourly", "minutely"),
        allowNull: false,
      },
      signed: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
        defaultValue: false,
      },
      cancelled: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
        defaultValue: false,
      },
      sign_type: {
        type: DataTypes.ENUM("physical", "remote", "none"),
        allowNull: false,
        defaultValue: "none",
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["id"],
        },
      ],
      sequelize,
      modelName: "Order",
      tableName: "orders",
      timestamps: false,
    }
  );

  return Order;
};

export default initOrder;
