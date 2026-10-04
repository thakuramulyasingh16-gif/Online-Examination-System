require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { sequelize, ensureDatabaseExists } = require('./config/db');
const User = require('./models/User');
const Exam = require('./models/Exam');
const Question = require('./models/Question');
const Result = require('./models/Result');
const Warning = require('./models/Warning');
const ActivityLog = require('./models/ActivityLog');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Active Students tracking (memory for quick access)
const activeStudents = new Map(); // socketId -> { userId, name, examId, status, lastFrame }

// Socket.io for Real-time Monitoring
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    // If admin joins, send current student list immediately
    if (roomId === 'admin-monitoring') {
      socket.emit('active_students', Array.from(activeStudents.entries()));
    }
  });

  socket.on('student_join', (data) => {
    const { userId, name, examId, examTitle } = data;
    activeStudents.set(socket.id, { 
      userId, 
      name, 
      examId, 
      examTitle, 
      status: 'active', 
      warnings: 0,
      startTime: new Date()
    });
    // Notify all admins about updated list
    io.to('admin-monitoring').emit('active_students', Array.from(activeStudents.entries()));
  });

  socket.on('student-frame', (data) => {
    const studentInfo = activeStudents.get(socket.id);
    if (studentInfo) {
      studentInfo.lastFrame = data.frame;
    }
    socket.to('admin-monitoring').emit('admin-receive-frame', {
      studentId: socket.id,
      ...data
    });
  });

  socket.on('student-activity-log', async (data) => {
    const { userId, examId, eventType } = data;
    try {
      await ActivityLog.create({ userId, examId, eventType });
      socket.to('admin-monitoring').emit('admin-receive-log', {
        studentId: socket.id,
        eventType,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Error saving activity log:', err);
    }
  });

  socket.on('send_warning', async (data) => {
    const { studentSocketId, userId, examId, message } = data;
    try {
      const warningCount = await Warning.count({ where: { userId, examId } }) + 1;
      await Warning.create({ userId, examId, message, count: warningCount });
      
      const studentInfo = activeStudents.get(studentSocketId);
      if (studentInfo) {
        studentInfo.warnings = warningCount;
      }

      // Send to specific student
      io.to(studentSocketId).emit('receive_warning', { message, count: warningCount });

      if (warningCount >= 10) {
        io.to(studentSocketId).emit('student-exam-terminated', { message: 'Exam terminated due to exceeding warning limit (10).' });
        activeStudents.delete(studentSocketId);
      }
      
      io.to('admin-monitoring').emit('active_students', Array.from(activeStudents.entries()));
    } catch (err) {
      console.error('Error sending warning:', err);
    }
  });

  socket.on('disconnect', () => {
    if (activeStudents.has(socket.id)) {
      activeStudents.delete(socket.id);
      io.to('admin-monitoring').emit('active_students', Array.from(activeStudents.entries()));
    }
    socket.to('admin-monitoring').emit('student-disconnected', socket.id);
    console.log('User disconnected:', socket.id);
  });
});

// Associations
Exam.hasMany(Question, { foreignKey: 'examId', onDelete: 'CASCADE' });
Question.belongsTo(Exam, { foreignKey: 'examId' });

User.hasMany(Result, { foreignKey: 'userId', onDelete: 'CASCADE' });
Result.belongsTo(User, { foreignKey: 'userId' });

Exam.hasMany(Result, { foreignKey: 'examId', onDelete: 'CASCADE' });
Result.belongsTo(Exam, { foreignKey: 'examId' });

User.hasMany(Warning, { foreignKey: 'userId', onDelete: 'CASCADE' });
Warning.belongsTo(User, { foreignKey: 'userId' });

Exam.hasMany(Warning, { foreignKey: 'examId', onDelete: 'CASCADE' });
Warning.belongsTo(Exam, { foreignKey: 'examId' });

User.hasMany(ActivityLog, { foreignKey: 'userId', onDelete: 'CASCADE' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

Exam.hasMany(ActivityLog, { foreignKey: 'examId', onDelete: 'CASCADE' });
ActivityLog.belongsTo(Exam, { foreignKey: 'examId' });

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));

// Serve the built React frontend (production). Falls back to index.html for
// client-side routes so refreshing /admin, /exam/1 etc. keeps working.
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

const seedAdmin = async () => {
  const adminExists = await User.findOne({ where: { role: 'admin' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      loginId: 'admin',
      password: hashedPassword,
      role: 'admin',
    });
    console.log('Default admin created: loginId: admin, password: admin123');
  }
};

const startServer = async () => {
  try {
    await ensureDatabaseExists();
    // `alter: true` re-issues ALTER TABLE on every start, which TiDB rejects for
    // UNIQUE columns. For hosted databases (DB_SSL / DATABASE_URL) only create
    // missing tables; set DB_SYNC_ALTER=true to force alter.
    const hosted = process.env.DB_SSL === 'true' || !!process.env.DATABASE_URL;
    const alter = process.env.DB_SYNC_ALTER
      ? process.env.DB_SYNC_ALTER === 'true'
      : !hosted;
    await sequelize.sync({ alter });
    console.log('Database connected and synced successfully');
    await seedAdmin();
    http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Server startup error:');
    console.error(err);
    process.exit(1);
  }
};

startServer();
