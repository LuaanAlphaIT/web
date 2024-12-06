const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    seat: {
        seat_number: { type: String, required: true },
        class: { type: String, required: true, enum: ["Economy", "Business", "First"] },
        gate: { type: String },
        is_child_seat: { type: Boolean, default: false }
    },
    flight: {
        flight_id: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", required: true },
        flight_code: { type: String, required: true },
        departure: { type: String, required: true },
        destination: { type: String, required: true },
        departure_time: { type: Date, required: true },
        arrival_time: { type: Date, required: true }
    },
    buyer: {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        full_name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        preferred_language: { type: String, required: true }
    },
    price: { type: Number, required: true },
    purchased_at: { type: Date, default: Date.now }
}, { timestamps: true });

// Tạo chỉ mục để tối ưu hóa truy vấn
ticketSchema.index({ "buyer.user_id": 1 });
ticketSchema.index({ "flight.flight_id": 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
