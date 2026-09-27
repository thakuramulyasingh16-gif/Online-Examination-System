const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Result = sequelize.define('Result', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  examId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  percentage: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('completed', 'terminated'),
    defaultValue: 'completed',
  },
});

module.exports = Result;
