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
    try {
        const { aircraftId, flight_number, updateData } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!aircraftId && !flight_number) {
            return res.status(400).json({ message: "Vui lòng cung cấp ID hoặc số hiệu máy bay để chỉnh sửa." });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Dữ liệu cần cập nhật không được để trống." });
        }

        // Tìm và cập nhật thông tin máy bay
        const updatedAircraft = await Aircraft.findOneAndUpdate(
            aircraftId ? { _id: aircraftId } : { flight_number },
            { $set: updateData },
            { new: true, runValidators: true } // Trả về tài liệu đã cập nhật và kiểm tra dữ liệu
        );

        if (!updatedAircraft) {
            return res.status(404).json({ message: "Không tìm thấy máy bay cần chỉnh sửa." });
        }

        res.status(200).json({
            message: "Thông tin máy bay đã được cập nhật thành công.",
            data: updatedAircraft
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi chỉnh sửa thông tin máy bay.",
            error: err.message
        });
    }
};


const getAircraftData = async (req, res) => {
    try {
        const { flight_number } = req.query;

        if (flight_number) {
            // Lấy thông tin chi tiết của một máy bay
            const foundAircraft = await Aircraft.findOne({ flight_number });

            if (!foundAircraft) {
                return res.status(404).json({ message: "Không tìm thấy thông tin máy bay." });
            }

            return res.status(200).json({
                message: "Thông tin máy bay.",
                data: foundAircraft
            });
        }

        // Lấy danh sách toàn bộ máy bay
        const aircraftList = await Aircraft.find();

        res.status(200).json({
            message: "Danh sách máy bay.",
            aircraft: aircraftList
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy thông tin máy bay.",
            error: err.message
        });
    }
};


const deleteAircraftData = async (req, res) => {
    try {
        const { aircraft } = req.body;

        // Kiểm tra xem thông tin aircraft có được cung cấp không
        if (!aircraft || (!aircraft.flight_number && !aircraft.aircraftId)) {
            return res.status(400).json({ message: "Vui lòng cung cấp ID hoặc số hiệu máy bay trong đối tượng 'aircraft'." });
        }

        // Tìm và xóa máy bay theo ID hoặc flight_number
        const deletedAircraft = await Aircraft.findOneAndDelete(
            aircraft.aircraftId ? { _id: aircraft.aircraftId } : { flight_number: aircraft.flight_number }
        );

        if (!deletedAircraft) {
            return res.status(404).json({ message: "Không tìm thấy máy bay cần xóa." });
        }

        res.status(200).json({
            message: "Máy bay đã được xóa thành công.",
            data: deletedAircraft
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi xóa máy bay.",
            error: err.message
        });
    }
};

module.exports = {
    aircraftDataEntry,
    editAircraftData,
    getAircraftData,
    deleteAircraftData
};
