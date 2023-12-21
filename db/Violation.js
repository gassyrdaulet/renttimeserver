import { DataTypes, Model } from "sequelize";

const initViolation = (sequelize) => {
  class Violation extends Model {}
  Violation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      comment: {
        type: DataTypes.STRING(200),
      },
      specie_id: {
        type: DataTypes.INTEGER,
        unsigned: true,
      },
      client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        unsigned: true,
      },
      specie_violation_type: {
        type: DataTypes.ENUM("broken", "missing"),
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
      modelName: "Violation",
      tableName: "violations",
      timestamps: false,
    }
  );
  return Violation;
};

export default initViolation;
