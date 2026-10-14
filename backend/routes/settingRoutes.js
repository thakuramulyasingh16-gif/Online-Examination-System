const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getSettings, updateSettings, changeAdminPassword } = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.get('/', getSettings);
router.put('/', protect, admin, upload.single('logo'), updateSettings);
router.put('/change-password', protect, admin, changeAdminPassword);

module.exports = router;
