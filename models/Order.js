// const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = require('../config/db');
// const User = require('./User');

// const Order = sequelize.define('Order', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
// },
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: "User",
//       key: "id",
//     },
//   },

//   totalPrice : {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },

//   paymentMethod: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     defaultValue: "Cash On Delivery"
//   },

//   status: {
//     type: DataTypes.ENUM('Pending', 'Processing', 'Delivered'),
//   },
// }, {
//   sequelize,
//   timestamps: true,
//   modelName: 'Order',
// });

// // Association between User and UserNotification
// User.hasMany(Order, { foreignKey: 'userID' });
// Order.belongsTo(User, { foreignKey: 'userID', as: 'user' });

// module.exports = Order;

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Order = sequelize.define(
  "order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    items: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "[]",
    },

    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Cash On Delivery",
    },
    status: {
      type: DataTypes.ENUM("Pending", "Processing", "Delivered", "Cancel"),
      allowNull: false,
      defaultValue: "Pending",
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },

    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
    refundRemarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    reciever_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reciever_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    billing_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reciever_contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "Order",
  }
);

// Association between User and Order
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = Order;
