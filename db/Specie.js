import { DataTypes, Model } from "sequelize";

const initSpecie = (sequelize) => {
  class Specie extends Model {}
  Specie.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      good: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "available",
          "broken",
          "repairing",
          "missing",
          "busy"
        ),
        allowNull: false,
      },
      order: {
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
        {
          unique: true,
          fields: ["code"],
        },
      ],
      sequelize,
      modelName: "Specie",
      tableName: "species",
      timestamps: false,
    }
  );
  return Specie;
};

export default initSpecie;
