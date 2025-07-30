const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Subscription = sequelize.define(
  "subscription",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.ENUM("active", "canceled", "expired"),
      defaultValue: "active",
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Subscription;
