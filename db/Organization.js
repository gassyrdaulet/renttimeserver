import { DataTypes, Model } from "sequelize";

const initOrganization = (sequelize) => {
  class Organization extends Model {}

  Organization.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unsigned: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      owner: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      address: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      start_work: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_work: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      region: {
        type: DataTypes.ENUM("kz"),
        allowNull: false,
      },
      activated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      premium: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      city: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      bank_company_type: {
        type: DataTypes.ENUM("АО", "ТОО", "ОАО", "ИП"),
        allowNull: false,
      },
      company_type: {
        type: DataTypes.ENUM("АО", "ТОО", "ОАО", "ИП"),
        allowNull: false,
      },
      bank_company_name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      company_name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      template: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "original",
      },
      kz_paper_bik: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      kz_paper_bin: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      kz_paper_iik: {
        type: DataTypes.STRING(20),
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
      modelName: "Organization",
      tableName: "organizations",
      timestamps: false,
    }
  );

  return Organization;
};

export default initOrganization;
