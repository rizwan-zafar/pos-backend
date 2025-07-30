const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Review = sequelize.define(
  "review",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products", 
        key: "id",
      },
    },
     adminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
         },
    reviewerName: {
      type: DataTypes.STRING,
      allowNull: true,
        },
    ratings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("block", "unblock"),
      defaultValue: "unblock",
      allowNull: false,
    },
  },
  {
    timestamps: true, 
    tableName: "reviews", 
  }
);

module.exports = Review;
