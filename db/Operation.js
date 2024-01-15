import { DataTypes, Model } from "sequelize";

const initOperation = (sequelize) => {
  class Operation extends Model {}

  Operation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("control", "courier", "debt", "payment"),
      },
      workshift_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      positive: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
        defaultValue: true,
      },
      fee: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      payment_method: {
        type: DataTypes.STRING(20),
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
      modelName: "Operation",
      tableName: "operations",
      timestamps: false,
    }
  );

  return Operation;
};

export default initOperation;
