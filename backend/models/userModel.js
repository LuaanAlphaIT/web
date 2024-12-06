const mongoose = require("mongoose");
const nationalities = require("../utils/nationalities")

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    last_name: { type: String, required: true },
    middle_and_first_name: { type: String, required: true },
    birth_date: { type: Date, required: true },
    nationality: { type: String, required: true, enum: nationalities },
    language: { type: String, required: true }, // Ngôn ngữ ưu tiên
    phone: { type: String, required: true },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }] // Danh sách ID vé
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
