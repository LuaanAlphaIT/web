const express = require("express");
const {
    createFlight,
    searchFlight,
    deleteFlight,
    editFlight,
    flightStatistics
} = require("../controllers/flightController");
const authenticateToken = require("../middlewares/authenticateToken");
const checkRole = require("../middlewares/checkRole");

const router = express.Router();

// Chỉ admin được phép tạo chuyến bay mới
router.post('/', authenticateToken, checkRole("admin"), createFlight);
router.get('/search', searchFlight);
router.delete("/:id", authenticateToken, checkRole('admin'), deleteFlight);
router.put('/:flight_code', authenticateToken, checkRole('admin'), editFlight);
router.get('/statistics', authenticateToken, checkRole('admin'), flightStatistics)

module.exports = router;
