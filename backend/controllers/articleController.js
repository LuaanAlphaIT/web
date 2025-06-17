const Article = require("../models/articleModel");

/**
 * Tạo bài viết mới.
 * @param {*} req 
 * @param {*} res 
 */
const createArticle = async (req, res) => {
    try {
        const { title, author, content, thumbnail, reading_time } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!title || !author || !content || !thumbnail || !reading_time) {
            return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin bài viết." });
        }

        // Tạo bài viết mới
        const newArticle = new Article({ title, author, content, thumbnail, reading_time });
        const savedArticle = await newArticle.save();

        res.status(201).json({
            message: "Bài viết đã được tạo thành công.",
            data: savedArticle
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi tạo bài viết.",
            error: err.message
        });
    }
};

const getArticles = async (req, res) => {
    try {
        const { id } = req.query; // Lấy ID từ query params

        // Nếu có ID, trả về bài viết theo ID
        if (id) {
            const article = await Article.findById(id);
            if (!article) {
                return res.status(404).json({ message: "Không tìm thấy bài viết." });
            }
            return res.status(200).json({
                message: "Thông tin bài viết.",
                data: article
            });
        }

        // Nếu không có ID, trả về danh sách toàn bộ bài viết
        const articles = await Article.find().sort({ createdAt: -1 }); // Sắp xếp bài viết mới nhất lên đầu
        res.status(200).json({
            message: "Danh sách bài viết.",
            data: articles
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy bài viết.",
            error: err.message
        });
    }
};

const updateArticle = async (req, res) => {
    try {
        const { id, title, author, content, thumbnail, reading_time } = req.body;

        // Kiểm tra ID có được cung cấp không
        if (!id) {
            return res.status(400).json({ message: "Vui lòng cung cấp ID bài viết cần cập nhật." });
        }

        // Kiểm tra xem bài viết có tồn tại không
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: "Không tìm thấy bài viết." });
        }

        // Cập nhật thông tin bài viết
        if (title) article.title = title;
        if (author) article.author = author;
        if (content) article.content = content;
        if (thumbnail) article.thumbnail = thumbnail;
        if (reading_time) article.reading_time = reading_time;

        // Lưu lại thay đổi
        const updatedArticle = await article.save();

        res.status(200).json({
            message: "Bài viết đã được cập nhật thành công.",
            data: updatedArticle
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi cập nhật bài viết.",
            error: err.message
        });
    }
};

const deleteArticle = async (req, res) => {
    try {
        const { id } = req.body; // Lấy ID bài viết từ request body

        // Kiểm tra xem ID có được cung cấp không
        if (!id) {
            return res.status(400).json({ message: "Vui lòng cung cấp ID bài viết cần xóa." });
        }

        // Tìm và xóa bài viết theo ID
        const deletedArticle = await Article.findByIdAndDelete(id);

        // Kiểm tra xem bài viết có tồn tại không
        if (!deletedArticle) {
            return res.status(404).json({ message: "Không tìm thấy bài viết cần xóa." });
        }

        res.status(200).json({
            message: "Bài viết đã được xóa thành công.",
            data: deletedArticle
        });
    } catch (err) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi xóa bài viết.",
            error: err.message
        });
    }
};

module.exports = {
    createArticle,
    getArticles,
    updateArticle,
    deleteArticle
};
