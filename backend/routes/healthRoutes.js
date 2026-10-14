const express = require('express');
const { sequelize } = require('../config/db');

const router = express.Router();

// GET /api/health  -> server + database status
router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: 'connected',
  };

  try {
    await sequelize.authenticate();
    res.status(200).json(health);
  } catch (err) {
    health.status = 'error';
    health.database = 'disconnected';
    res.status(503).json(health);
  }
});

module.exports = router;
