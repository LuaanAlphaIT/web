const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
    seat_number: { type: String, required: true },
    class: { type: String, required: true, enum: ["Economy", "Business", "First"] },
    is_child_seat: { type: Boolean, default: false },
    gate: { type: String }, // Cổng ghế
    is_available: { type: Boolean, default: true }, // Trạng thái ghế có sẵn
    ticket_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", default: null } // Liên kết đến người mua vé
});

const flightSchema = new mongoose.Schema({
    flight_code: { type: String, required: true, unique: true },
    flight_number: { type: String, required: true },
    departure: { type: String, required: true },
    destination: { type: String, required: true },
    departure_time: { type: Date, required: true },
    arrival_time: { type: Date, required: true },
    seats: [seatSchema] // Danh sách ghế của chuyến bay
}, { timestamps: true });

const Flight = mongoose.model("Flight", flightSchema);
module.exports = Flight;
