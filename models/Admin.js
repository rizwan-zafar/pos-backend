const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/db");

const Admin = sequelize.define(
  "admin",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      notifications: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "notifications",
          key: "id",
        },
      },
    },
    seennotifications: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "notifications",
        key: "id",
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: bcrypt.hashSync("12345678", 10), // Hash default password
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // notification: {
    //   type: DataTypes.JSON,
    //   allowNull: true,
    //   defaultValue: [],
    // },
    // seennotification: {
    //   type: DataTypes.JSON,
    //   allowNull: true,
    //   defaultValue: [],
    // },
    joiningDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

Admin.associate = (models) => {
  Admin.hasMany(models.AdminNotification, {
    foreignKey: "adminId",
    as: "admin",
  });
};

module.exports = Admin;
