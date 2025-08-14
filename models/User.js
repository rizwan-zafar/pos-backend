
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Review = require('./Reviews');
const User = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
},
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ""
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
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  }, 
  opening_balance: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ntn: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  strn: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  remember:{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isVerified :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
   status: {
      type: DataTypes.ENUM("active",   "block"),
      defaultValue: "active",
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("vendor", "customer"),
      allowNull: false,
      defaultValue: "customer"
    },
      rawAddress: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
}, {
  timestamps: true,
});
User.hasMany(Review, { foreignKey: "userId" });
Review.belongsTo(User, { foreignKey: "userId",  as: "user" });


module.exports = User;
