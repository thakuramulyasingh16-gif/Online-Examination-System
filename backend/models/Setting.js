const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Setting = sequelize.define('Setting', {
  collegeName: {
    type: DataTypes.STRING,
    defaultValue: 'City College',
  },
  collegeLogo: {
    type: DataTypes.STRING,
    defaultValue: '/logo.jpg',
  },
  passingCriteria: {
    type: DataTypes.INTEGER,
    defaultValue: 40,
  },
  warningLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  contactEmail: {
    type: DataTypes.STRING,
    defaultValue: 'admin@citycollege.edu',
  },
});

module.exports = Setting;
