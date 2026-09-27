const { sequelize } = require('./config/db');
const User = require('./models/User');

const checkDb = async () => {
  try {
    await sequelize.authenticate();
    const users = await User.findAll({ attributes: ['loginId', 'role'] });
    console.log('Users in DB:', JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
checkDb();
