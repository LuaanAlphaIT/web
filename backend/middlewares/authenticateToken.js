const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Nếu cần lấy thêm thông tin người dùng từ DB

/**
 * Middleware xác thực token.
 */
const authenticateToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header Authorization

    if (!token) {
        return res.status(401).json({ message: "Token không được cung cấp. Yêu cầu đăng nhập." });
    }

    try {
        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        // Tìm người dùng nếu cần (tùy theo ứng dụng)
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        // Gắn thông tin người dùng vào req để sử dụng trong các API tiếp theo
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
        };

        next(); // Chuyển tiếp yêu cầu đến API tiếp theo
    } catch (err) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
};

module.exports = authenticateToken;
