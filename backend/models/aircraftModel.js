const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
    seat_number: { type: String, required: true },
    class: { type: String, required: true, enum: ["Economy", "Business", "First"] },
    is_child_seat: { type: Boolean, default: false },
    gate: { type: String }
});

const aircraftSchema = new mongoose.Schema({
    model_name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    flight_number: { type: String, required: true, unique: true }, // Số hiệu máy bay, duy nhất
    seat_capacity: { type: Number, required: true },
    max_distance_km: { type: Number },
    speed_kmh: { type: Number },
    length_m: { type: Number },
    wingspan_m: { type: Number },
    height_m: { type: Number },
    seats: [seatSchema] // Danh sách ghế của máy bay
}, { timestamps: true });

const Aircraft = mongoose.model("Aircraft", aircraftSchema);
module.exports = Aircraft;
