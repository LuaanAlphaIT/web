const mongoose = require('mongoose');

// Hàm kết nối tới MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Kết nối thành công tới MongoDB.');
    } catch (err) {
        console.error(`Lỗi kết nối tới MongoDB: ${err.message}`);
        process.exit(1); // Thoát ứng dụng nếu không kết nối được
    }
};

module.exports = connectDB; // Xuất hàm kết nối
