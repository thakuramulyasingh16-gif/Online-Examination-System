const { sequelize } = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const resetAdmin = async () => {
  try {
    await sequelize.authenticate();
    const hashedPassword = await bcrypt.hash('admin123', 10);
    let admin = await User.findOne({ where: { loginId: 'admin' } });
    if (admin) {
      admin.password = hashedPassword;
      await admin.save();
      console.log('Admin password reset to "admin123"');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
resetAdmin();
