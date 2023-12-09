import { DataTypes, Model } from "sequelize";

const initBadClient = (sequelize) => {
  class BadClient extends Model {}

  BadClient.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cellphone: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      second_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      father_name: {
        type: DataTypes.STRING(50),
      },
      address: {
        type: DataTypes.STRING(500),
      },
      email: {
        type: DataTypes.STRING(50),
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "undefined"),
        defaultValue: "undefined",
      },
      paper_givendate: {
        type: DataTypes.DATE,
      },
      paper_person_id: {
        type: DataTypes.STRING(12),
        allowNull: false,
        unique: true,
      },
      paper_serial_number: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      paper_authority: {
        type: DataTypes.ENUM("mvdrk"),
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING(500),
        allowNull: false,
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
      modelName: "BadClient",
      tableName: "kz_bad_clients",
      timestamps: false,
    }
  );

  return BadClient;
};

export default initBadClient;
