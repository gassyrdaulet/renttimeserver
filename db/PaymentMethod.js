import { DataTypes, Model } from "sequelize";

const initPaymentMethod = (sequelize) => {
  class PaymentMethod extends Model {}

  PaymentMethod.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      comission: {
        type: DataTypes.FLOAT(5),
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
      modelName: "PaymentMethod",
      tableName: "payment_methods",
      timestamps: false,
    }
  );

  return PaymentMethod;
};

export default initPaymentMethod;
