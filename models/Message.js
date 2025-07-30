const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Message = sequelize.define(
  "message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    fullName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone: Sequelize.STRING,
    message: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("resolved", "pending"),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Message;
