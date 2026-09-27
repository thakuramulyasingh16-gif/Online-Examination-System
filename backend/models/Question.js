const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Question = sequelize.define('Question', {
  examId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  option1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  option2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  option3: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  option4: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correctAnswer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  marks: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
});

module.exports = Question;
