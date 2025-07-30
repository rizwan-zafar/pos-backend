const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../../config/db");
const Product = require("../Product");

const Banner = sequelize.define(
  "banner",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    smImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endingDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    alt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products", // Table name for Product
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

Banner.belongsTo(Product, { foreignKey: "pId", as: "product" });

module.exports = Banner;
