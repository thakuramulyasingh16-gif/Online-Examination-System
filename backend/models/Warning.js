const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Warning = sequelize.define('Warning', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  examId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Warnings',
  timestamps: false,
});

module.exports = Warning;
