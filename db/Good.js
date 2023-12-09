import { DataTypes, Model } from "sequelize";

const initGood = (sequelize) => {
  class Good extends Model {}

  Good.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      photo: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      compensation_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      price_per_minute: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unsigned: true,
      },
      price_per_hour: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unsigned: true,
      },
      price_per_day: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unsigned: true,
      },
      price_per_month: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unsigned: true,
      },
      created_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
      modelName: "Good",
      tableName: "goods",
      timestamps: false,
    }
  );

  return Good;
};

export default initGood;
