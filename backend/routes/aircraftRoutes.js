const express = require('express');
const {
    aircraftDataEntry
} = require('../controllers/aircraftController');

const authenticateToken = require('../middlewares/authenticateToken');
const checkRole = require("../middlewares/checkRole");
const router = express.Router();

router.post('/create', authenticateToken, checkRole("admin"), aircraftDataEntry);

/**
 * Xuất router máy bay.
 */
module.exports = router; // Xuất tuyến để sử dụng trong app.js
