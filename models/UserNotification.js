// UserNotification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const UserNotification = sequelize.define('usernotification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    notification: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    seennotification: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id'
        }
    }
}, {
    timestamps: true,
});

// Association between User and UserNotification
User.hasMany(UserNotification, { foreignKey: 'userId' });
UserNotification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = UserNotification;
