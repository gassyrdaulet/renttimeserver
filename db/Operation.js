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
        type: DataTypes.ENUM("payment", "add", "remove", "debt"),
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
      modelName: "Operation",
      tableName: "operations",
      timestamps: false,
    }
  );

  return Operation;
};

export default initOperation;
