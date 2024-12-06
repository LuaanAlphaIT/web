const express = require('express');
const {
    registerUser,
    loginUser,
    editUser,
    deleteUser,
    getUser
} = require('../controllers/userController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/edit', editUser);

router.post('/delete', deleteUser);

router.get('/get', authenticateToken, getUser);

/**
 * Xuất router user.
 */
module.exports = router; // Xuất tuyến để sử dụng trong app.js
