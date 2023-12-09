import { DataTypes, Model } from "sequelize";

const initExemption = (sequelize) => {
  class Exemption extends Model {}

  Exemption.init(
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
      cause: {
        type: DataTypes.STRING(150),
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
      modelName: "Exemption",
      tableName: "exemptions",
      timestamps: false,
    }
  );

  return Exemption;
};

export default initExemption;
