require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

console.log('--- DB Config DEBUG ---');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD Loaded:', !!process.env.DB_PASSWORD);
console.log('-----------------------');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const ensureDatabaseExists = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.end();
    console.log(`Database "${process.env.DB_NAME}" ensured.`);
  } catch (error) {
    console.error('Error ensuring database exists:', error.message);
  }
};

module.exports = sequelize;
module.exports.sequelize = sequelize;
module.exports.ensureDatabaseExists = ensureDatabaseExists;
