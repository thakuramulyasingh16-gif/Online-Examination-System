const { sequelize } = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const resetStudent = async () => {
  try {
    await sequelize.authenticate();
    const hashedPassword = await bcrypt.hash('student123', 10);
    let student = await User.findOne({ where: { loginId: 'Sample123' } });
    if (student) {
      student.password = hashedPassword;
      await student.save();
      console.log('Student "Sample123" password reset to "student123"');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
resetStudent();
