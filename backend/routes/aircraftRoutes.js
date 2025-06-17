const express = require('express');
const {
    aircraftDataEntry,
    deleteAircraftData,
    getAircraftData,
    editAircraftData
} = require('../controllers/aircraftController');

const authenticateToken = require('../middlewares/authenticateToken');
const checkRole = require("../middlewares/checkRole");
const router = express.Router();

router.post('/', authenticateToken, checkRole("admin"), aircraftDataEntry);
router.delete('/', authenticateToken, checkRole("admin"), deleteAircraftData);
router.get('/', getAircraftData);
router.put('/', authenticateToken, checkRole("admin"), editAircraftData);

/**
 * Xuất router máy bay.
 */
module.exports = router; // Xuất tuyến để sử dụng trong app.js
