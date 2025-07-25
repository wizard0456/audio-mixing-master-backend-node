"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const BlogController_1 = require("../controllers/BlogController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
router.get('/blogs', BlogController_1.BlogController.index);
router.get('/blogs/categories', BlogController_1.BlogController.getCategories);
router.get('/blogs/stats', BlogController_1.BlogController.getStats);
router.get('/blogs/:id', BlogController_1.BlogController.show);
router.get('/blog/categories', BlogController_1.BlogController.getCategories);
router.get('/blog/stats', BlogController_1.BlogController.getStats);
router.get('/blog/:id', BlogController_1.BlogController.show);
router.post('/blogs', auth_1.auth, upload.none(), BlogController_1.BlogController.create);
router.put('/blogs/:id', auth_1.auth, BlogController_1.BlogController.update);
router.delete('/blogs/:id', auth_1.auth, BlogController_1.BlogController.destroy);
router.post('/blogs/:blog_id/upload-html', auth_1.auth, BlogController_1.BlogController.uploadHtml);
exports.default = router;
//# sourceMappingURL=blog.js.map