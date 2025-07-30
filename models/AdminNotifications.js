// AdminNotification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Admin = require('./Admin');

const AdminNotification = sequelize.define('AdminNotification', {
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
    adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Admin',
            key: 'id'
        }
    }
}, {
    timestamps: true,
});

// Association between Admin and AdminNotification
Admin.hasMany(AdminNotification, { foreignKey: 'adminId' });
AdminNotification.belongsTo(Admin, { foreignKey: 'adminId', as: 'admin' });

module.exports = AdminNotification;
