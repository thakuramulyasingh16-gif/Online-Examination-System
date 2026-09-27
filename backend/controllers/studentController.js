const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const createStudent = async (req, res) => {
  try {
    const { name, email, loginId, password } = req.body;
    
    if (!name || !loginId || !password) {
      return res.status(400).json({ message: 'Name, Login ID, and Password are required' });
    }

    const userExists = await User.findOne({ where: { loginId } });
    if (userExists) return res.status(400).json({ message: 'Login ID already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    const student = await User.create({
      name,
      email: email || null,
      loginId,
      password: hashedPassword,
      role: 'student',
      profileImage,
    });

    res.status(201).json(student);
  } catch (error) {
    console.error('Create Student Error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { name, email, loginId, password } = req.body;
    const student = await User.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (loginId && loginId !== student.loginId) {
      const exists = await User.findOne({ where: { loginId } });
      if (exists) return res.status(400).json({ message: 'Login ID already taken' });
    }

    const updateData = { name, email, loginId };
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    if (req.file) {
      // Delete old image if exists
      if (student.profileImage) {
        const oldImagePath = path.join(__dirname, '..', student.profileImage);
        if (fs.existsSync(oldImagePath)) {
           try { fs.unlinkSync(oldImagePath); } catch(e) { console.error("Unlink error:", e); }
        }
      }
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    await student.update(updateData);
    res.json(student);
  } catch (error) {
    console.error('Update Student Error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (student.profileImage) {
      const imagePath = path.join(__dirname, '..', student.profileImage);
      if (fs.existsSync(imagePath)) {
        try { fs.unlinkSync(imagePath); } catch(e) { console.error("Unlink error:", e); }
      }
    }

    await student.destroy();
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await User.findAll({ where: { role: 'student' } });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createStudent, updateStudent, deleteStudent, getAllStudents };
