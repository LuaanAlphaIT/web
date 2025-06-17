const Aircraft = require("../models/aircraftModel");
const Flight = require("../models/flightModel");
const Ticket = require('../models/ticketModel')

/**
 * Tạo chuyến bay mới.
 * @param {*} req 
 * @param {*} res 
 */
const createFlight = async (req, res) => {
    try {
        const { flight } = req.body; // Dữ liệu chuyến bay nằm trong đối tượng 'flight'

        // Kiểm tra dữ liệu đầu vào
        const errors = { body: [] };
        if (!flight) {
            return res.status(400).json({ message: "Vui lòng cung cấp thông tin chuyến bay trong đối tượng 'flight'." });
        }

        const { flight_code, flight_number, departure, destination, departure_time, arrival_time } = flight;

        if (!flight_code || !flight_number || !departure || !destination || !departure_time || !arrival_time) {
            errors.body.push("Vui lòng cung cấp đầy đủ thông tin chuyến bay.");
        }

        if (new Date(departure_time) >= new Date(arrival_time)) {
            errors.body.push("Thời gian khởi hành phải nhỏ hơn thời gian hạ cánh.");
        }

        if (errors.body.length > 0) {
            return res.status(400).json({ errors });
        }

        // Kiểm tra mã chuyến bay trùng lặp
        const existingFlight = await Flight.findOne({ flight_code });
        if (existingFlight) {
            return res.status(400).json({ message: "Mã chuyến bay đã tồn tại. Vui lòng chọn mã khác." });
        }

        // Tìm máy bay theo số hiệu máy bay (flight_number)
        const aircraft = await Aircraft.findOne({ flight_number });
        if (!aircraft) {
            return res.status(404).json({ message: "Không tìm thấy thông tin máy bay với số hiệu đã cung cấp." });
        }

        // Sao chép danh sách ghế từ máy bay
        const seats = aircraft.seats.map(seat => ({
            seat_number: seat.seat_number,
            class: seat.class,
            gate: seat.gate,
            is_child_seat: seat.is_child_seat,
            is_available: true
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
            flightflight: savedFlight
        });

    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi tạo chuyến bay.",
            error: err.message
        });
    }
};

const searchFlight = async (req, res) => {
    try {
        // Lấy các tham số tìm kiếm từ request query
        const {
            flight_code,
            flight_number,
            departure,
            destination,
            departure_time,
            arrival_time
        } = req.query;

        // Xây dựng bộ lọc tìm kiếm
        const filters = {};

        if (flight_code) filters.flight_code = flight_code;
        if (flight_number) filters.flight_number = flight_number;
        if (departure) filters.departure = departure;
        if (destination) filters.destination = destination;

        // Kiểm tra thời gian khởi hành
        if (departure_time) {
            const parsedDepartureTime = new Date(departure_time);
            if (!isNaN(parsedDepartureTime)) {
                filters.departure_time = { $gte: parsedDepartureTime }; // Lấy các chuyến bay sau thời gian này
            }
        }

        // Kiểm tra thời gian hạ cánh
        if (arrival_time) {
            const parsedArrivalTime = new Date(arrival_time);
            if (!isNaN(parsedArrivalTime)) {
                filters.arrival_time = { $lte: parsedArrivalTime }; // Lấy các chuyến bay trước thời gian này
            }
        }

        // Tìm kiếm chuyến bay theo bộ lọc
        const flights = await Flight.find(filters);

        res.status(200).json({
            message: "Danh sách chuyến bay.",
            data: flights
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi tìm kiếm chuyến bay.",
            error: err.message
        });
    }
};

const deleteFlight = async (req, res) => {
    try {
        const { id } = req.params;  // Lấy id chuyến bay từ params
        const userRole = req.user.role;  // Vai trò từ token

        // Chỉ admin mới có quyền xóa
        if (userRole !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này." });
        }

        // Tìm chuyến bay theo ID
        const flight = await Flight.findById(id);
        if (!flight) {
            return res.status(404).json({ message: "Không tìm thấy chuyến bay." });
        }

        // Xóa chuyến bay
        await Flight.findByIdAndDelete(id);

        res.status(200).json({
            message: "Chuyến bay đã được xóa thành công.",
            flight_id: id
        });

    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi xóa chuyến bay.",
            error: err.message
        });
    }
};

const editFlight = async (req, res) => {
    try {
        const { flight_code } = req.params;  // Lấy mã chuyến bay từ params
        const { departure, destination, departure_time, arrival_time } = req.body;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa chuyến bay." });
        }

        const flight = await Flight.findOne({ flight_code });

        if (!flight) {
            return res.status(404).json({ message: "Không tìm thấy chuyến bay." });
        }

        if (departure) flight.departure = departure;
        if (destination) flight.destination = destination;
        if (departure_time) flight.departure_time = departure_time;
        if (arrival_time) flight.arrival_time = arrival_time;

        // Lưu thông tin chuyến bay đã cập nhật
        const updatedFlight = await flight.save();

        res.status(200).json({
            message: "Cập nhật thông tin chuyến bay thành công.",
            data: updatedFlight
        });

    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi cập nhật chuyến bay.",
            error: err.message
        });
    }
};

const flightStatistics = async (req, res) => {
    try {
        const flights = await Flight.find({}, 'flight_code seats');

        const statistics = await Promise.all(flights.map(async (flight) => {
            const soldTickets = await Ticket.countDocuments({
                'flight.flight_code': flight.flight_code
            });

            const totalSeats = flight.seats.length;

            return {
                flight_code: flight.flight_code,
                totalSeats,
                soldTickets,
                availableTickets: totalSeats - soldTickets
            };
        }));

        res.status(200).json({
            message: "Thống kê vé theo chuyến bay thành công.",
            statistics
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi thống kê.",
            error: err.message
        });
    }
}

module.exports = {
    createFlight,
    searchFlight,
    deleteFlight,
    editFlight,
    flightStatistics
};
