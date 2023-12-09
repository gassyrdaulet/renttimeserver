import { DataTypes, Model } from "sequelize";

const initDeliveryPayoff = (sequelize) => {
  class DeliveryPayoff extends Model {}

  DeliveryPayoff.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      comment: {
        type: DataTypes.STRING(200),
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      courier_id: {
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
      modelName: "DeliveryPayoff",
      tableName: "delivery_payoffs",
      timestamps: false,
    }
  );

  return DeliveryPayoff;
};

export default initDeliveryPayoff;
