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

const parseCsvString = (csvText) => {
  const lines = csvText.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const parseLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cols[idx] !== undefined ? cols[idx] : '';
    });
    rows.push(rowObj);
  }
  return rows;
};

const bulkUploadStudents = async (req, res) => {
  try {
    let studentsData = req.body;

    if (req.file) {
      const content = fs.readFileSync(req.file.path, 'utf8');
      const parsed = parseCsvString(content);
      studentsData = parsed.map((p) => ({
        name: p.name || p.studentname || p.fullname,
        email: p.email || p.emailaddress,
        loginId: p.loginid || p.rollno || p.studentid || p.username,
        password: p.password,
        isActive: p.isactive !== 'false' && p.status !== 'inactive',
      }));
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    } else if (typeof req.body === 'string' && req.body.includes(',')) {
      const parsed = parseCsvString(req.body);
      studentsData = parsed.map((p) => ({
        name: p.name || p.studentname || p.fullname,
        email: p.email || p.emailaddress,
        loginId: p.loginid || p.rollno || p.studentid,
        password: p.password,
        isActive: p.isactive !== 'false',
      }));
    } else if (req.body && typeof req.body.csv === 'string') {
      const parsed = parseCsvString(req.body.csv);
      studentsData = parsed.map((p) => ({
        name: p.name || p.studentname || p.fullname,
        email: p.email || p.emailaddress,
        loginId: p.loginid || p.rollno || p.studentid,
        password: p.password,
        isActive: p.isactive !== 'false',
      }));
    } else if (req.body && Array.isArray(req.body.students)) {
      studentsData = req.body.students;
    }

    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      return res.status(400).json({ message: 'Valid student records or CSV content is required' });
    }

    const createdList = [];
    const errors = [];

    for (let i = 0; i < studentsData.length; i++) {
      const row = studentsData[i];
      if (!row || !row.name || !row.name.trim()) {
        errors.push({ row: i + 1, error: 'Name is required' });
        continue;
      }

      const finalLoginId = row.loginId && String(row.loginId).trim()
        ? String(row.loginId).trim()
        : generateRandomLoginId();

      const finalPassword = row.password && String(row.password).trim()
        ? String(row.password).trim()
        : generateRandomPassword();

      const existing = await User.findOne({ where: { loginId: finalLoginId } });
      if (existing) {
        errors.push({ row: i + 1, error: `Login ID ${finalLoginId} already exists` });
        continue;
      }

      const hashedPassword = await bcrypt.hash(finalPassword, 10);
      const student = await User.create({
        name: row.name.trim(),
        email: row.email ? String(row.email).trim() : null,
        loginId: finalLoginId,
        password: hashedPassword,
        role: 'student',
        isActive: row.isActive !== false && row.isActive !== 'false',
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
