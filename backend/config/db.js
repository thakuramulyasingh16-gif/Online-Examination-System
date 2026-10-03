require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

// Production (Render): a single DATABASE_URL pointing at Postgres.
// Local development: classic MySQL settings from backend/.env.
const usePostgres = !!process.env.DATABASE_URL;

// TiDB Cloud (and most hosted MySQL) require TLS: set DB_SSL=true.
const mysqlSsl = process.env.DB_SSL === 'true'
  ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  : undefined;

let sequelize;

if (usePostgres) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  });
  console.log('DB: using Postgres via DATABASE_URL');
} else {
  console.log('--- DB Config DEBUG (MySQL) ---');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_PASSWORD Loaded:', !!process.env.DB_PASSWORD);
  console.log('-------------------------------');

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      dialectOptions: mysqlSsl ? { ssl: mysqlSsl } : {},
    }
  );
}

const ensureDatabaseExists = async () => {
  // On Postgres (Render) the database is created by the platform.
  if (usePostgres) return;

  const mysql = require('mysql2/promise');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: mysqlSsl,
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
