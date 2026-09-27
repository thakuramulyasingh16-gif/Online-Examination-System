const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Exam = sequelize.define('Exam', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER, // duration in minutes
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Exam;
