const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
    seat_number: { type: String, required: true },
    class: { type: String, required: true, enum: ["Economy", "Business", "First"] },
    is_child_seat: { type: Boolean, default: false },
    gate: { type: String }
});

const aircraftSchema = new mongoose.Schema({
    model_name: { type: String, required: true }, //Tên mẫu
    manufacturer: { type: String, required: true }, // Nhà sản xuất
    flight_number: { type: String, required: true, unique: true }, // Số hiệu máy bay
    seat_capacity: { type: Number, required: true }, //Số lượng ghếghế
    max_distance_km: { type: Number }, //Khoảng cách tối đa
    speed_kmh: { type: Number }, //Tốc độ
    length_m: { type: Number }, //Chiều dài
    wingspan_m: { type: Number }, // Sải cánh
    height_m: { type: Number }, // Chiều cao
    seats: [seatSchema] // Danh sách ghế của máy bay
}, { timestamps: true });

const Aircraft = mongoose.model("Aircraft", aircraftSchema);
module.exports = Aircraft;
