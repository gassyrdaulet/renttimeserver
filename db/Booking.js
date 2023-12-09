import { DataTypes, Model } from "sequelize";

const initBooking = (sequelize) => {
  class Booking extends Model {}

  Booking.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      good_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      booked_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      term_ms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unsigned: true,
      },
      client_id: {
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
      modelName: "Booking",
      tableName: "booking",
      timestamps: false,
    }
  );

  return Booking;
};

export default initBooking;
