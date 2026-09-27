const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;
    const user = await User.findOne({ where: { loginId } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, loginId: user.loginId, role: user.role, profileImage: user.profileImage } });
  } catch (error) {
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
    
    if (loginId && loginId !== user.loginId) {
      const exists = await User.findOne({ where: { loginId } });
      if (exists) return res.status(400).json({ message: 'Login ID already taken' });
      user.loginId = loginId;
    }

    if (name) user.name = name;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user.id, name: user.name, loginId: user.loginId, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, getMe, updateProfile };
