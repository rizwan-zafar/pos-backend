const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Category = sequelize.define("category", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  children: {
    type: DataTypes.JSON, // child
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("Show", "Hide"),
    defaultValue: "Show",
  },
});

Category.associate = (models) => {
  Category.hasMany(models.Product, { foreignKey: "category_id" });
};

module.exports = Category;
