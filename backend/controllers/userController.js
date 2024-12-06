const User = require('../models/userModel');
const nationalities = require('../utils/nationalities');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


/**
 * Đăng ký tài khoản khách hàng.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const registerUser = async (req, res) => {
    try {
        const errors = { body: [] };

        // Lấy dữ liệu từ req.body.user
        const { user } = req.body;
        if (!user) {
            errors.body.push("Dữ liệu khách hàng không được để trống.");
            return res.status(400).json({ errors });
        }

        const {
            last_name,
            middle_and_first_name,
            birth_date,
            nationality,
            language,
            email,
            phone,
            password,
        } = user;



        const nameRegex = /^[A-Z ]+$/; // Chỉ cho phép chữ hoa và khoảng trắng

        if (!last_name || last_name.trim() === "") {
            errors.body.push("Họ không được để trống.");
        } else if (!last_name || !nameRegex.test(last_name)) {
            errors.body.push("Họ phải là chữ Latin và viết hoa.");
        }

        if (!middle_and_first_name || middle_and_first_name.trim() === "") {
            errors.body.push("Đệm và tên không được để trống.");
        } else if (!middle_and_first_name || !nameRegex.test(middle_and_first_name)) {
            errors.body.push("Đệm và tên phải là chữ Latin và viết hoa.");
        }

        if (!birth_date || isNaN(new Date(birth_date))) {
            errors.body.push("Ngày sinh không hợp lệ.");
        }

        if (!nationality || nationality.trim() === "") {
            errors.body.push("Quốc tịch không được để trống.");
        } else if (!nationality || !nationalities.includes(nationality)) {
            errors.body.push(`Quốc tịch '${nationality}' không hợp lệ.`);
        }

        if (!language || language.trim() === "") {
            errors.body.push("Ngôn ngữ không được để trống.");
        }

        // Kiểm tra email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.body.push("Email không hợp lệ.");
        }

        // Kiểm tra số điện thoại
        const phoneRegex = /^[0-9]{1,12}$/; // Chỉ cho phép số, tối đa 12 ký tự
        if (!phone || !phoneRegex.test(phone)) {
            errors.body.push("Số điện thoại phải là số và tối đa 12 ký tự.");
        }

        const existingUser = await User.
            findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            if (existingUser.email === email)
                errors.body.push("Email đã được sử dụng.");
            if (existingUser.phone === phone)
                errors.body.push("Số điện thoại đã được sử dụng.");
        }


        // Kiểm tra mật khẩu
        if (!password || password.length < 8) {
            errors.body.push("Mật khẩu phải chứa ít nhất 8 ký tự.");
        }

        // Nếu có lỗi, trả về danh sách lỗi
        if (errors.body.length > 0) {
            return res.status(400).json({ errors });
        }

        // Băm mật khẩu
        const saltRounds = 10; // Số vòng salt
        const hashedPassword = await bcrypt.hash(password, saltRounds);


        // Nếu không có lỗi, tiếp tục lưu khách hàng vào cơ sở dữ liệu
        const newUser = new User({
            last_name,
            middle_and_first_name,
            birth_date,
            nationality,
            language,
            email,
            phone,
            password: hashedPassword,
            //role: "customer"
        });

        const savedUser = await newUser.save();

        // Phản hồi thành công
        res.status(201).json({
            message: "Đăng ký tài khoản thành công.",
            user: {
                id: savedUser._id,
                last_name: savedUser.last_name,
                middle_and_first_name: savedUser.middle_and_first_name,
                email: savedUser.email,
                phone: savedUser.phone,
                role: savedUser.role
            },
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi đăng ký tài khoản.",
            error: err.message,
        });
    }
};

/**
 * Khách hàng đăng nhập.
 * @param {*} req 
 * @param {*} res 
 */
const loginUser = async (req, res) => {
    try {
        const errors = { body: [] };

        const { user } = req.body;
        if (!user) {
            errors.body.push("Dữ liệu khách hàng không được để trống.");
            return res.status(400).json({ errors });
        }

        const {
            email,
            password
        } = user;
        if (!email || email.trim() === "") {
            errors.body.push("Email không được để trống.");
        }
        // Kiểm tra mật khẩu
        if (!password || password.length < 8) {
            errors.body.push("Mật khẩu phải chứa ít nhất 8 ký tự.");
        }
        // Nếu có lỗi đầu vào, trả về danh sách lỗi
        if (errors.body.length > 0) {
            return res.status(400).json({ errors });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
        }

        const token = jwt.sign(
            { id: existingUser._id, role: existingUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Trả về phản hồi thành công
        res.status(200).json({
            message: "Đăng nhập thành công.",
            token: token,
            user: {
                id: existingUser._id,
                email: existingUser.email,
                role: existingUser.role,
                last_name: existingUser.last_name,
                middle_and_first_name: existingUser.middle_and_first_name,
            },
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi đăng nhập tài khoản.",
            error: err.message,
        });
    }
}

/**
 * Chỉnh sửa thông tin khách hàng.
 */
const editUser = async () => {

}

/**
 * Xóa tài khoản.
 */
const deleteUser = async () => {

}

/**
 * Lấy thông tin người dùng từ cơ sở dữ liệu dựa trên id trong token.
 * @param {*} req
 * @param {*} res
 */
const getUser = async (req, res) => {
    try {
        // Lấy id từ req.user (được gắn bởi authenticateToken)
        const userId = req.user.id;

        // Tìm kiếm người dùng trong cơ sở dữ liệu
        const user = await User.findById(userId).select('-password'); // Không trả về trường password
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy thông tin người dùng." });
        }

        res.status(200).json({
            message: "Thông tin người dùng.",
            user,
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy thông tin người dùng.",
            error: err.message,
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    editUser,
    deleteUser,
    getUser
}; // Xuất chức năng ra để sử dụng
