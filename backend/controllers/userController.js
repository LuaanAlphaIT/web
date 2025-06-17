const User = require('../models/userModel');
const nationalities = require('../utils/nationalities');
const Ticket = require('../models/ticketModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


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
            { expiresIn: '30m' }
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
const editUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, language, nationality, phone } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy thông tin người dùng." });
        }

        if (user.role !== 'customer') {
            return res.status(403).json({ message: "Chỉ khách hàng mới có thể chỉnh sửa tài khoản." });
        }

        const errors = { body: [] };

        // Kiểm tra quốc tịch
        if (nationality && !nationalities.includes(nationality)) {
            errors.body.push(`Quốc tịch '${nationality}' không hợp lệ.`);
        }

        // Kiểm tra số điện thoại
        if (phone) {
            const phoneRegex = /^[0-9]{1,12}$/;
            if (!phoneRegex.test(phone)) {
                errors.body.push("Số điện thoại phải là số và tối đa 12 ký tự.");
            } else {
                const existingPhone = await User.findOne({ phone });
                if (existingPhone && !existingPhone._id.equals(new mongoose.Types.ObjectId(userId))) {
                    errors.body.push("Số điện thoại đã được sử dụng.");
                }
            }
        }

        // Kiểm tra email
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.body.push("Email không hợp lệ.");
            } else {
                const existingEmail = await User.findOne({ email });
                if (existingEmail && !existingEmail._id.equals(new mongoose.Types.ObjectId(userId))) {
                    errors.body.push("Email đã được sử dụng.");
                }
            }
        }


        // Nếu có lỗi, trả về danh sách lỗi
        if (errors.body.length > 0) {
            return res.status(400).json({ errors });
        }

        // Cập nhật thông tin
        if (email) user.email = email;
        if (language) user.language = language;
        if (nationality) user.nationality = nationality;
        if (phone) user.phone = phone;

        // Lưu thông tin người dùng đã cập nhật
        const updatedUser = await user.save();

        const updatedUserWithoutPassword = updatedUser.toObject();
        delete updatedUserWithoutPassword.password;

        res.status(200).json({
            message: "Cập nhật thông tin khách hàng thành công.",
            data: updatedUserWithoutPassword
        });

    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi chỉnh sửa thông tin người dùng.",
            error: err.message,
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        // Tìm người dùng
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy thông tin người dùng." });
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không chính xác." });
        }

        // Kiểm tra mật khẩu mới
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({
                message: "Mật khẩu mới phải chứa ít nhất 8 ký tự."
            });
        }

        // Băm và cập nhật mật khẩu mới
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;

        // Lưu thông tin người dùng đã cập nhật
        await user.save();

        res.status(200).json({
            message: "Đổi mật khẩu thành công."
        });

    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi đổi mật khẩu.",
            error: err.message,
        });
    }
};


/**
 * Xóa tài khoản.
 */
const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy thông tin người dùng." });
        }

        if (user.role !== 'customer') {
            return res.status(403).json({ message: "Chỉ khách hàng mới có thể xóa tài khoản." });
        }

        await Ticket.deleteMany({ 'buyer.user_id': userId })

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: "Xóa người dùng thành công."
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi xóa người dùng.",
            error: err.message,
        });
    }
}

/**
 * Lấy thông tin người dùng từ cơ sở dữ liệu dựa trên id trong token.
 * @param {*} req
 * @param {*} res
 */
const getCustomer = async (req, res) => {
    try {
        const userId = req.user.id;

        // Tìm người dùng và populate danh sách vé
        const user = await User.findById(userId)
            .select('-password')  // Loại bỏ trường password
            .populate({
                path: 'tickets',  // Populate danh sách vé
                select: '_id flight seat',  // Lựa chọn trường cần thiết
                populate: {
                    path: 'flight.flight_id',  // Populate thêm thông tin chuyến bay
                    select: 'departure destination departure_time flight_code'  // Lấy các trường của chuyến bay
                }
            });

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy thông tin người dùng." });
        }

        // Chuyển đổi định dạng vé
        const formattedTickets = user.tickets.map(ticket => ({
            id: ticket._id,
            flight_code: ticket.flight.flight_id.flight_code,
            departure: ticket.flight.flight_id.departure,
            destination: ticket.flight.flight_id.destination,
            departure_time: ticket.flight.flight_id.departure_time,
            seat: ticket.seat.seat_number,
            class: ticket.seat.class
        }));

        res.status(200).json({
            message: "Thông tin người dùng.",
            user: {
                ...user.toObject(),
                tickets: formattedTickets
            },
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy thông tin người dùng.",
            error: err.message,
        });
    }
};

const getCustomerInfoByAdmin = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID khách hàng từ params

        // Tìm thông tin khách hàng trong cơ sở dữ liệu
        const customer = await User.findById(id).select("-password"); // Không trả về mật khẩu
        if (!customer) {
            return res.status(404).json({ message: "Không tìm thấy thông tin khách hàng." });
        }

        res.status(200).json({
            message: "Thông tin khách hàng.",
            data: customer
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy thông tin khách hàng.",
            error: err.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    editUser,
    deleteUser,
    getCustomer,
    getCustomerInfoByAdmin,
    changePassword
}; // Xuất chức năng ra để sử dụng
