const Aircraft = require('../models/aircraftModel');

/**
 * Quản trị nhập thông tin máy bay.
 * @param {*} req 
 * @param {*} res 
 */
const aircraftDataEntry = async (req, res) => {
    try {
        // Lấy đối tượng aircraft từ request body
        const { aircraft } = req.body;

        // Danh sách lỗi
        const errors = { body: [] };

        // Kiểm tra aircraft có tồn tại
        if (!aircraft) {
            errors.body.push("Dữ liệu máy bay không được để trống.");
            return res.status(400).json({ errors });
        }

        // Lấy các trường từ aircraft
        const {
            model_name,
            manufacturer,
            flight_number,
            seat_capacity,
            max_distance_km,
            speed_kmh,
            length_m,
            wingspan_m,
            height_m,
            seats
        } = aircraft;

        // Kiểm tra các trường bắt buộc
        if (!model_name || model_name.trim() === "") {
            errors.body.push("Tên mẫu máy bay không được để trống.");
        }

        if (!manufacturer || manufacturer.trim() === "") {
            errors.body.push("Tên nhà sản xuất máy bay không được để trống.");
        }

        if (!seat_capacity || typeof seat_capacity !== "number" || seat_capacity <= 0) {
            errors.body.push("Tổng số ghế phải là một số hợp lệ.");
        }

        if (!flight_number || flight_number.trim() === "") {
            errors.body.push("Số hiệu máy bay không được để trống.");
        }

        // Kiểm tra tính duy nhất của flight_number
        const existingAircraft = await Aircraft.findOne({ flight_number });
        if (existingAircraft) {
            errors.body.push("Số hiệu máy bay đã tồn tại.");
        }

        // Kiểm tra các trường không bắt buộc (nếu có)
        const numericFields = { max_distance_km, speed_kmh, length_m, wingspan_m, height_m };
        for (const [field, value] of Object.entries(numericFields)) {
            if (value !== undefined && typeof value !== "number") {
                errors.body.push(`Trường '${field}' phải là một số.`);
            }
        }

        // Kiểm tra danh sách ghế (seats)
        if (!Array.isArray(seats)) {
            errors.body.push("Danh sách ghế phải là một mảng.");
        } else if (seats.length !== seat_capacity) {
            errors.body.push(`Danh sách ghế không khớp với tổng số ghế (${seat_capacity}).`);
        } else {
            seats.forEach((seat, index) => {
                if (!seat.seat_number || seat.seat_number.trim() === "") {
                    errors.body.push(`Ghế số ${index + 1}: Tọa độ ghế không được để trống.`);
                }

                if (!seat.class || !["Economy", "Business", "First"].includes(seat.class)) {
                    errors.body.push(`Ghế số ${index + 1}: Hạng ghế không hợp lệ.`);
                }

                if (typeof seat.is_child_seat !== "boolean") {
                    errors.body.push(`Ghế số ${index + 1}: Trường 'is_child_seat' phải là kiểu Boolean.`);
                }

                if (seat.gate && typeof seat.gate !== "string") {
                    errors.body.push(`Ghế số ${index + 1}: Trường 'gate' phải là kiểu String.`);
                }
            });
        }

        // Nếu có lỗi, trả về danh sách lỗi
        if (errors.body.length > 0) {
            return res.status(400).json({ errors });
        }

        // Tạo đối tượng máy bay mới
        const newAircraft = new Aircraft({
            model_name,
            manufacturer,
            flight_number,
            seat_capacity,
            max_distance_km,
            speed_kmh,
            length_m,
            wingspan_m,
            height_m,
            seats
        });

        // Lưu máy bay vào cơ sở dữ liệu
        const savedAircraft = await newAircraft.save();

        // Trả về phản hồi thành công
        res.status(201).json({
            message: "Thông tin máy bay đã được nhập thành công.",
            data: savedAircraft
        });

    } catch (err) {
        // Xử lý lỗi
        res.status(500).json({
            message: "Đã xảy ra lỗi khi nhập thông tin máy bay.",
            error: err.message
        });
    }
};



const editAircraftData = async (req, res) => {

}


const getAircraftData = async () => {

}


const deleteAircraftData = async () => {

}

module.exports = {
    aircraftDataEntry,
    editAircraftData,
    getAircraftData,
    deleteAircraftData
};
