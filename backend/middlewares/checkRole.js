/**
 * Middleware kiểm tra vai trò người dùng.
 * @param {*} requiredRole Vai trò yêu cầu (ví dụ: "admin").
 * @returns Middleware để kiểm tra vai trò.
 */
const checkRole = (requiredRole) => {
    return (req, res, next) => {
        try {
            // Kiểm tra xem thông tin người dùng có tồn tại không
            if (!req.user) {
                return res.status(403).json({ message: "Bạn không có quyền truy cập." });
            }

            // Kiểm tra vai trò người dùng
            const { role } = req.user;
            if (role !== requiredRole) {
                return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này." });
            }

            // Vai trò hợp lệ, tiếp tục
            next();
        } catch (err) {
            res.status(500).json({ message: "Đã xảy ra lỗi khi kiểm tra vai trò.", error: err.message });
        }
    };
};

module.exports = checkRole;
