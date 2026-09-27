const { sequelize } = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const resetAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    let admin = await User.findOne({ where: { loginId: 'admin' } });
    const hashedPassword = await bcrypt.hash('admin123', 10);

    if (admin) {
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
      console.log('Admin password reset to "admin123"');
    } else {
      await User.create({
        name: 'Admin User',
        loginId: 'admin',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Admin user created with password "admin123"');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetAdmin();
