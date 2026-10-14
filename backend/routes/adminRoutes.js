const express = require('express');
const router = express.Router();
const { getOverviewStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/overview', protect, admin, getOverviewStats);

module.exports = router;
