const Aircraft = require("../models/aircraftModel");
const Flight = require("../models/flightModel");

/**
 * Tạo chuyến bay mới.
 * @param {*} req 
 * @param {*} res 
 */
const createFlight = async (req, res) => {
    try {
        const { flight_code, flight_number, departure, destination, departure_time, arrival_time } = req.body;

        // Kiểm tra các trường bắt buộc
        const errors = { body: [] };
        if (!flight_code || !flight_number || !departure || !destination || !departure_time || !arrival_time) {
            errors.body.push("Vui lòng cung cấp đầy đủ thông tin chuyến bay.");
        }

        if (errors.body.length > 0) {
            return res.status(400).json({ errors });
        }

        // Tìm máy bay theo số hiệu máy bay (flight_number)
        const aircraft = await Aircraft.findOne({ flight_number });
        if (!aircraft) {
            return res.status(404).json({ message: "Không tìm thấy thông tin máy bay với số hiệu đã cung cấp." });
        }

        // Lấy danh sách ghế từ máy bay và tạo trạng thái mặc định
        const seats = aircraft.seats.map(seat => ({
            seat_number: seat.seat_number,
            class: seat.class,
            is_available: true // Tất cả ghế đều khả dụng khi tạo chuyến bay
        }));

        // Tạo đối tượng chuyến bay mới
        const newFlight = new Flight({
            flight_code,
            flight_number,
            departure,
            destination,
            departure_time,
            arrival_time,
            seats
        });

        // Lưu chuyến bay vào cơ sở dữ liệu
        const savedFlight = await newFlight.save();

        // Trả về phản hồi thành công
        res.status(201).json({
            message: "Chuyến bay đã được tạo thành công.",
            data: savedFlight
        });

    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi tạo chuyến bay.",
            error: err.message
        });
    }
};

module.exports = { createFlight };
