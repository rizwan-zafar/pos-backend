const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Product = require("../Product");

const VideoBanner = sequelize.define(
  "videobanner",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    video: {
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
        model: "products",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

VideoBanner.belongsTo(Product, { foreignKey: "pId", as: "product" });

module.exports = VideoBanner;


