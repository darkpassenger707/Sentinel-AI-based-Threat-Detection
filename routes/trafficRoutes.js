const express = require('express');
const router = express.Router();
const TrafficLog = require('../models/TrafficLog');

router.get('/history', async (req, res, next) => {
  try {
    const logs = await TrafficLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;