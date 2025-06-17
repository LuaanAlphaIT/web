const Ticket = require("../models/ticketModel");
const Flight = require("../models/flightModel");
const User = require("../models/userModel");

const bookTicket = async (req, res) => {
    try {
        const userId = req.user.id;  // ID của khách hàng từ token
        const userRole = req.user.role;  // Vai trò từ token
        const { flight_code, seat_class } = req.body;

        // Chỉ cho phép khách hàng đặt vé
        if (userRole !== "customer") {
            return res.status(403).json({ message: "Chỉ khách hàng mới có thể đặt vé." });
        }

        // Kiểm tra dữ liệu đầu vào
        if (!flight_code || !seat_class) {
            return res.status(400).json({ message: "Vui lòng cung cấp mã chuyến bay và hạng vé." });
        }

        // Tìm chuyến bay theo mã
        const flight = await Flight.findOne({ flight_code });
        if (!flight) {
            return res.status(404).json({ message: "Không tìm thấy chuyến bay." });
        }

        // Tìm ghế trống đầu tiên theo hạng vé
        const availableSeat = flight.seats.find(seat => seat.class === seat_class && seat.is_available);

        if (!availableSeat) {
            return res.status(400).json({ message: "Hết ghế trống cho hạng vé này." });
        }

        // Lấy thông tin khách hàng từ cơ sở dữ liệu
        const buyer = await User.findById(userId);
        if (!buyer) {
            return res.status(404).json({ message: "Không tìm thấy thông tin khách hàng." });
        }

        // Tạo vé mới
        const newTicket = new Ticket({
            flight: {
                flight_id: flight._id,
                flight_code: flight.flight_code,
                departure: flight.departure,
                destination: flight.destination,
                departure_time: flight.departure_time,
                arrival_time: flight.arrival_time
            },
            seat: {
                seat_number: availableSeat.seat_number,
                class: availableSeat.class,
                gate: availableSeat.gate,
                is_child_seat: availableSeat.is_child_seat
            },
            buyer: {
                user_id: buyer._id,
                full_name: `${buyer.middle_and_first_name} ${buyer.last_name}`,
                email: buyer.email,
                phone: buyer.phone,
                preferred_language: buyer.language
            },
            purchased_at: new Date()
        });

        // Lưu vé vào cơ sở dữ liệu
        const savedTicket = await newTicket.save();

        // Đánh dấu ghế đã được đặt (cập nhật is_available)
        availableSeat.is_available = false;
        await flight.save();

        // Thêm ticket_id vào danh sách vé của khách hàng
        buyer.tickets.push(savedTicket._id);
        await buyer.save();

        res.status(201).json({
            message: "Vé đã được đặt thành công.",
            data: savedTicket
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi đặt vé.",
            error: err.message
        });
    }
};

const cancelTicket = async (req, res) => {
    try {
        const { ticket_id } = req.params;
        const userId = req.user.id;  // Lấy id người dùng từ token

        // Tìm vé theo id
        const ticket = await Ticket.findById(ticket_id);
        if (!ticket) {
            return res.status(404).json({ message: "Không tìm thấy vé cần hủy." });
        }

        // Kiểm tra người sở hữu vé
        if (ticket.buyer.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền hủy vé này." });
        }

        // Tìm chuyến bay liên quan
        const flight = await Flight.findById(ticket.flight.flight_id);
        if (!flight) {
            return res.status(404).json({ message: "Không tìm thấy chuyến bay liên quan." });
        }

        // Kiểm tra thời hạn hủy vé (phải trước 24h so với thời gian khởi hành)
        const now = new Date();
        const departureTime = new Date(flight.departure_time);
        const timeDiff = (departureTime - now) / (1000 * 60 * 60);  // Tính bằng giờ

        if (timeDiff <= 24) {
            return res.status(400).json({ message: "Vé chỉ được hủy trước 24 giờ so với giờ khởi hành." });
        }

        // Cập nhật ghế thành ghế trống (is_available: true)
        const seatIndex = flight.seats.findIndex(seat => seat.seat_number === ticket.seat.seat_number);
        if (seatIndex !== -1) {
            flight.seats[seatIndex].is_available = true;
        }
        await flight.save();

        // Xóa vé khỏi collection `tickets`
        await Ticket.findByIdAndDelete(ticket_id);

        // Xóa ticket_id khỏi danh sách vé trong user
        await User.findByIdAndUpdate(
            userId,
            { $pull: { tickets: ticket_id } },
            { new: true }
        );

        res.status(200).json({
            message: "Vé đã được hủy thành công.",
            ticket_id
        });

    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi hủy vé.",
            error: err.message
        });
    }
};

const getTicketById = async (req, res) => {
    try {
        const ticketId = req.params.id;

        // Tìm vé theo ID (không cần kiểm tra user_id)
        const ticket = await Ticket.findById(ticketId, 'buyer flight seat purchased_at');

        if (!ticket) {
            return res.status(404).json({ message: "Không tìm thấy vé." });
        }

        // Trả về thông tin vé mà không kiểm tra quyền sở hữu
        res.status(200).json({
            message: "Lấy thông tin vé thành công.",
            ticket
        });

    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy thông tin vé.",
            error: err.message
        });
    }
};

module.exports = {
    bookTicket,
    cancelTicket,
    getTicketById
};