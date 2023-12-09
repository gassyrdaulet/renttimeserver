import { DataTypes, Model } from "sequelize";

const initExtension = (sequelize) => {
  class Extension extends Model {}

  Extension.init(
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
      renttime: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
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
      modelName: "Extension",
      tableName: "extensions",
      timestamps: false,
    }
  );

  return Extension;
};

export default initExtension;
