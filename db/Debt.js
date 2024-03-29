import { DataTypes, Model } from "sequelize";

const initDebt = (sequelize) => {
  class Debt extends Model {}

  Debt.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING(150),
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      workshift_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      closed: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["id"],
        },
        {
          unique: true,
          fields: ["id", "workshift_id"],
        },
      ],
      sequelize,
      modelName: "Debt",
      tableName: "debts",
      timestamps: false,
    }
  );

  return Debt;
};

export default initDebt;
