const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const generateRandomLoginId = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `STU${new Date().getFullYear()}${num}`;
};

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let pwd = '';
  for (let i = 0; i < 8; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${pwd}@1`;
};

const createStudent = async (req, res) => {
  try {
    const { name, email, loginId, password, isActive } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const finalLoginId = loginId && loginId.trim() !== '' ? loginId.trim() : generateRandomLoginId();
    const finalPassword = password && password.trim() !== '' ? password.trim() : generateRandomPassword();

    const userExists = await User.findOne({ where: { loginId: finalLoginId } });
    if (userExists) return res.status(400).json({ message: `Login ID "${finalLoginId}" already exists` });

    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    const student = await User.create({
      name,
      email: email || null,
      loginId: finalLoginId,
      password: hashedPassword,
      role: 'student',
      profileImage,
      isActive: isActive === 'false' || isActive === false ? false : true,
    });

    const studentResponse = student.toJSON();
    studentResponse.plainPassword = finalPassword;

    res.status(201).json(studentResponse);
  } catch (error) {
    console.error('Create Student Error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { name, email, loginId, password, isActive } = req.body;
    const student = await User.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (loginId && loginId !== student.loginId) {
      const exists = await User.findOne({ where: { loginId } });
      if (exists) return res.status(400).json({ message: 'Login ID already taken' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (loginId !== undefined) updateData.loginId = loginId;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    if (req.file) {
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
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await User.findAll({ 
      where: { role: 'student' },
      order: [['createdAt', 'DESC']]
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleStudentStatus = async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.isActive = !student.isActive;
    await student.save();

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const newPassword = req.body.newPassword && req.body.newPassword.trim() !== ''
      ? req.body.newPassword.trim()
      : generateRandomPassword();

    student.password = await bcrypt.hash(newPassword, 10);
    await student.save();

    res.json({
      message: 'Password reset successfully',
      loginId: student.loginId,
      newPassword,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkUploadStudents = async (req, res) => {
  try {
    const studentsData = req.body; // Expecting array of { name, email, loginId, password }
    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      return res.status(400).json({ message: 'Array of student records is required' });
    }

    const createdList = [];
    const errors = [];

    for (let i = 0; i < studentsData.length; i++) {
      const row = studentsData[i];
      if (!row.name || !row.name.trim()) {
        errors.push({ row: i + 1, error: 'Name is required' });
        continue;
      }

      const finalLoginId = row.loginId && row.loginId.trim()
        ? row.loginId.trim()
        : generateRandomLoginId();

      const finalPassword = row.password && row.password.trim()
        ? row.password.trim()
        : generateRandomPassword();

      const existing = await User.findOne({ where: { loginId: finalLoginId } });
      if (existing) {
        errors.push({ row: i + 1, error: `Login ID ${finalLoginId} already exists` });
        continue;
      }

      const hashedPassword = await bcrypt.hash(finalPassword, 10);
      const student = await User.create({
        name: row.name.trim(),
        email: row.email ? row.email.trim() : null,
        loginId: finalLoginId,
        password: hashedPassword,
        role: 'student',
        isActive: row.isActive !== false,
      });

      createdList.push({
        id: student.id,
        name: student.name,
        email: student.email,
        loginId: student.loginId,
        generatedPassword: finalPassword,
        isActive: student.isActive,
      });
    }

    res.status(201).json({
      message: `Successfully processed ${createdList.length} students`,
      createdCount: createdList.length,
      createdStudents: createdList,
      errors,
    });
  } catch (error) {
    console.error('Bulk Upload Error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

module.exports = {
  createStudent,
  updateStudent,
  deleteStudent,
  getAllStudents,
  toggleStudentStatus,
  resetPassword,
  bulkUploadStudents,
};
