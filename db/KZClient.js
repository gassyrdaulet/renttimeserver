import { DataTypes, Model } from "sequelize";

const initKZClient = (sequelize) => {
  class KZClient extends Model {}

  KZClient.init(
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
      orders_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      create_date: {
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
      modelName: "KZClient",
      tableName: "kz_clients",
      timestamps: false,
    }
  );

  return KZClient;
};

export default initKZClient;
