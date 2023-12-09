import { DataTypes, Model } from "sequelize";

const initOrderGood = (sequelize) => {
  class OrderGood extends Model {}

  OrderGood.init(
    {
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
        primaryKey: true,
      },
      specie_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
        primaryKey: true,
      },
      saved_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      saved_compensation_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      good_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
    },
    {
      sequelize,
      modelName: "OrderGood",
      tableName: "order_goods",
      timestamps: false,
    }
  );

  return OrderGood;
};

export default initOrderGood;
