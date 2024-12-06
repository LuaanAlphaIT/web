const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const aircraftRoutes = require('./routes/aircraftRoutes');

dotenv.config(); // Load biến môi trường từ tệp .env

connectDB(); // Kết nối cơ sở dữ liệu

const app = express();
app.use(express.json()); // Middleware xử lý JSON body

// Định tuyến cho khách hàng
app.use('/user', userRoutes);

app.use('/aircraft', aircraftRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));
