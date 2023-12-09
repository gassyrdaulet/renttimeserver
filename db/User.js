import { DataTypes, Model } from "sequelize";

const initUser = (sequelize) => {
  class User extends Model {}

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unsigned: true,
      },
      organization: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unsigned: true,
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
      cellphone: {
        type: DataTypes.STRING(30),
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
      modelName: "User",
      tableName: "users",
      timestamps: false,
    }
  );

  return User;
};

export default initUser;
