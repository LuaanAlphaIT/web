const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

// Cấu hình kết nối MongoDB
const uri = "mongodb://localhost:27017"; // Thay thế bằng kết nối của bạn
const dbName = "Qairline"; // Thay thế bằng tên database của bạn

// Tạo tài khoản admin
const createAdmin = async () => {
    try {
        const client = new MongoClient(uri);
        await client.connect();

        const db = client.db(dbName);
        const usersCollection = db.collection('users');

        const saltRounds = 10; // Số vòng salt
        const password = "12345678"; // Thay thế bằng mật khẩu của bạn
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const adminUser = {
            email: "admin@example.com", // Email admin
            password: hashedPassword, // Mật khẩu đã băm
            role: "admin", // Vai trò admin
            createdAt: new Date(), // Thời gian tạo
            updatedAt: new Date() // Thời gian cập nhật
        };

        const result = await usersCollection.insertOne(adminUser);
        console.log("Tài khoản admin đã được tạo:", result.insertedId);

        await client.close();
    } catch (err) {
        console.error("Đã xảy ra lỗi:", err.message);
    }
};

createAdmin();
