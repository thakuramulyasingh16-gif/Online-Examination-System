const { sequelize } = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const resetAdmin = async () => {
  try {
    await sequelize.authenticate();
    const hashedPassword = await bcrypt.hash('123456', 10);
    let admin = await User.findOne({ where: { loginId: 'admin' } });
    if (admin) {
      admin.password = hashedPassword;
      await admin.save();
      console.log('Admin updated with password: 123456');
    } else {
      await User.create({
        name: 'Admin',
        loginId: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin created with password: 123456');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
resetAdmin();
