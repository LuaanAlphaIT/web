const express = require("express");
const { createFlight } = require("../controllers/flightController");
const authenticateToken = require("../middlewares/authenticateToken");
const checkRole = require("../middlewares/checkRole");

const router = express.Router();

// Chỉ admin được phép tạo chuyến bay mới
router.post("/create", authenticateToken, checkRole("admin"), createFlight);

module.exports = router;
