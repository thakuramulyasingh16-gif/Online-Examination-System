const Setting = require('../models/Setting');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const getSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({
        collegeName: 'City College',
        collegeLogo: '/logo.jpg',
        passingCriteria: 40,
        warningLimit: 10,
        contactEmail: 'admin@citycollege.edu',
      });
    }
    res.json(setting);
  } catch (error) {
    console.error('Get Settings Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }

    const { collegeName, passingCriteria, warningLimit, contactEmail } = req.body;
    const updateData = {};
    if (collegeName !== undefined) updateData.collegeName = collegeName;
    if (passingCriteria !== undefined) updateData.passingCriteria = parseInt(passingCriteria);
    if (warningLimit !== undefined) updateData.warningLimit = parseInt(warningLimit);
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;

    if (req.file) {
      updateData.collegeLogo = `/uploads/${req.file.filename}`;
    }

    await setting.update(updateData);
    res.json(setting);
  } catch (error) {
    console.error('Update Settings Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const changeAdminPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const adminUser = await User.findByPk(req.user.id);
    if (!adminUser) return res.status(404).json({ message: 'Admin user not found' });

    if (oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, adminUser.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    adminUser.password = await bcrypt.hash(newPassword, 10);
    await adminUser.save();

    res.json({ message: 'Admin password updated successfully' });
  } catch (error) {
    console.error('Change Admin Password Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings, changeAdminPassword };
