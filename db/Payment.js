import { DataTypes, Model } from "sequelize";

const initPayment = (sequelize) => {
  class Payment extends Model {}

  Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      fee: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      type: {
        type: DataTypes.STRING(20),
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      verified_date: {
        type: DataTypes.DATE,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      delivery_id: {
        type: DataTypes.INTEGER,
        unsigned: true,
      },
      debt_id: {
        type: DataTypes.INTEGER,
        unsigned: true,
      },
      workshift_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      is_debt: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      for_courier: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      verified: {
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
      modelName: "Payment",
      tableName: "payments",
      timestamps: false,
    }
  );

  return Payment;
};

export default initPayment;
