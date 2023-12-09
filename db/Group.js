import { DataTypes, Model } from "sequelize";

const initGroup = (sequelize) => {
  class Group extends Model {}

  Group.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
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
      modelName: "Group",
      tableName: "groups_data",
      timestamps: false,
    }
  );

  return Group;
};

export default initGroup;
