import { DataTypes, Model } from "sequelize";

const initRole = (sequelize) => {
  class Role extends Model {}

  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unsigned: true,
      },
      admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      debt: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      courier: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      manager: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      owner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      modelName: "Role",
      tableName: "roles",
      timestamps: false,
    }
  );

  return Role;
};

export default initRole;
