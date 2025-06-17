const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    content: [
        {
            type: { type: String, enum: ["text", "image"], required: true },
            content: { type: String, required: true } // URL của ảnh hoặc nội dung văn bản
        }
    ],
    thumbnail: { type: String, required: true }, // Link ảnh từ Google Drive
    reading_time: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
