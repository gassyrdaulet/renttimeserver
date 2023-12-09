import { DataTypes, Model } from "sequelize";

const initWorkshift = (sequelize) => {
  class Workshift extends Model {}

  Workshift.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      open_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      close_date: {
        type: DataTypes.DATE,
      },
      responsible: {
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
      modelName: "Workshift",
      tableName: "workshifts",
      timestamps: false,
    }
  );

  return Workshift;
};

export default initWorkshift;
