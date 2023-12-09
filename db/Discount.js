import { DataTypes, Model } from "sequelize";

const initDiscount = (sequelize) => {
  class Discount extends Model {}

  Discount.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      reason: {
        type: DataTypes.STRING(150),
      },
      workshift_id: {
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
      modelName: "Discount",
      tableName: "discounts",
      timestamps: false,
    }
  );

  return Discount;
};

export default initDiscount;
