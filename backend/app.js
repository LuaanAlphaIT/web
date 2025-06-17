const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors");
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const aircraftRoutes = require('./routes/aircraftRoutes');
const flightRoutes = require('./routes/flightRoutes');
const articleRoutes = require('./routes/articleRoutes');
const ticketRoutes = require('./routes/ticketRoutes')

dotenv.config(); // Load biến môi trường từ tệp .env

connectDB(); // Kết nối cơ sở dữ liệu

const app = express();

app.use(cors());

app.use(express.json()); // Middleware xử lý JSON body

// Định tuyến cho khách hàng
app.use('/user', userRoutes);

app.use('/aircraft', aircraftRoutes);

app.use('/flight', flightRoutes);

app.use('/article', articleRoutes);

app.use('/ticket', ticketRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));
