const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Product = require("../Product");



const AppPromortion = sequelize.define("apppromotion", {
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
  alt: {
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
  app_store_url: {
    type: DataTypes.STRING,
  },
  play_store_url: {
    type: DataTypes.STRING,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "products", 
      key: "id",
    },
  },
}, {
  timestamps: true,
});

// Define relationship
AppPromortion.belongsTo(Product, { foreignKey: "productId", as: "product" });

module.exports = AppPromortion;
