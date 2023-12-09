import { DataTypes, Model } from "sequelize";

const initDelivery = (sequelize) => {
  class Delivery extends Model {}

  Delivery.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      address: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      cellphone: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      created_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      went_date: {
        type: DataTypes.DATE,
      },
      delivered_date: {
        type: DataTypes.DATE,
      },
      finished_date: {
        type: DataTypes.DATE,
      },
      comment: {
        type: DataTypes.STRING(200),
      },
      courier_id: {
        type: DataTypes.INTEGER,
        unsigned: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      workshift_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      status: {
        type: DataTypes.ENUM(
          "new",
          "wfd",
          "processing",
          "finished",
          "cancelled"
        ),
        allowNull: false,
      },
      direction: {
        type: DataTypes.ENUM("there", "here"),
        allowNull: false,
      },
      delivery_price_for_deliver: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      delivery_price_for_customer: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      payoff_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
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
      modelName: "Delivery",
      tableName: "deliveries",
      timestamps: false,
    }
  );

  return Delivery;
};

export default initDelivery;
