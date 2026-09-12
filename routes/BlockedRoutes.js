const express = require('express');
const router = express.Router();
const BlockedIP = require('../models/BlockedIP');

router.get('/', async (req, res, next) => {
  try {
    const blocked = await BlockedIP.find().sort({ blockedAt: -1 });
    res.json({ success: true, data: blocked });
  } catch (err) {
    next(err);
  }
});

router.delete('/:ip', async (req, res, next) => {
  try {
    await BlockedIP.findOneAndDelete({ ip: req.params.ip });
    res.json({ success: true, message: `IP ${req.params.ip} unblocked successfully` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;