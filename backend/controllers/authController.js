const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;
    if (!loginId || !password) {
      return res.status(400).json({ message: 'Login ID and password are required' });
    }

    const user = await User.findOne({ where: { loginId } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Your account is deactivated. Please contact the administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('CRITICAL: JWT_SECRET environment variable is missing!');
      return res.status(500).json({ message: 'Server security configuration error (missing JWT_SECRET)' });
    }

    // Check if admin is still using default password or flagged to change password
    let mustChangePassword = !!user.mustChangePassword;
    if (user.role === 'admin' && !mustChangePassword) {
      const isDefaultAdminPwd = await bcrypt.compare('admin123', user.password);
      if (isDefaultAdminPwd) {
        mustChangePassword = true;
      }
    }

    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '1d' });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        loginId: user.loginId,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isActive: user.isActive,
        mustChangePassword,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    user.password = await bcrypt.hash(newPassword.trim(), 10);
    user.mustChangePassword = false;
    await user.save();

    res.json({
      message: 'Password changed successfully',
      mustChangePassword: false,
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { loginId, password, name } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (loginId && loginId !== user.loginId) {
      const exists = await User.findOne({ where: { loginId } });
      if (exists) return res.status(400).json({ message: 'Login ID already taken' });
      user.loginId = loginId;
    }

    if (name) user.name = name;
    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }
    if (password && password.trim()) {
      user.password = await bcrypt.hash(password, 10);
      user.mustChangePassword = false;
    }

    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        loginId: user.loginId,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isActive: user.isActive,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, changePassword, getMe, updateProfile };
