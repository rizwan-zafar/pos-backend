
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Faq = sequelize.define('faq', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
},
  question: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  answer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
    timestamps: true,
  });
module.exports = Faq;
