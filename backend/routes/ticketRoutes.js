const express = require("express");
const {
    bookTicket,
    cancelTicket,
    getTicketById
} = require("../controllers/ticketController");
const authenticateToken = require("../middlewares/authenticateToken");
const checkRole = require("../middlewares/checkRole");

const router = express.Router();

// API đặt vé (chỉ cho khách hàng)
router.post("/", authenticateToken, checkRole('customer'), bookTicket);
router.delete("/:ticket_id", authenticateToken, checkRole('customer'), cancelTicket);
router.get('/:id', getTicketById);

module.exports = router;
