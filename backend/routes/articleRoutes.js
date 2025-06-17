const express = require("express");
const {
    createArticle,
    getArticles,
    updateArticle,
    deleteArticle
} = require("../controllers/articleController");
const authenticateToken = require("../middlewares/authenticateToken");
const checkRole = require("../middlewares/checkRole");

const router = express.Router();

// API tạo bài viết (chỉ admin có quyền)
router.post("/", authenticateToken, checkRole("admin"), createArticle);
router.get("/", getArticles);
router.put("/", authenticateToken, checkRole("admin"), updateArticle);
router.delete("/", authenticateToken, checkRole("admin"), deleteArticle);

module.exports = router;