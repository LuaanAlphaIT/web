const express = require('express');
const {
    registerUser,
    loginUser,
    editUser,
    deleteUser,
    getCustomer,
    getCustomerInfoByAdmin,
    changePassword
} = require('../controllers/userController');
const authenticateToken = require('../middlewares/authenticateToken');
const checkRole = require("../middlewares/checkRole");
const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.put('/edit', authenticateToken, editUser);

router.put('/password', authenticateToken, changePassword);

router.delete('/', authenticateToken, deleteUser);

router.get('/', authenticateToken, getCustomer);

router.get("/:id", authenticateToken, checkRole("admin"), getCustomerInfoByAdmin);


/**
 * Xuất router user.
 */
module.exports = router; // Xuất tuyến để sử dụng trong app.js
