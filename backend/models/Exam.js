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
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  passMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 40,
  },
  negativeMarking: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  shuffleQuestions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  shuffleOptions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Exam;
