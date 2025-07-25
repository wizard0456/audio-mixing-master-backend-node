"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogController = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = 'uploads/blog-html';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'text/html' || file.originalname.endsWith('.html')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only HTML files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});
class BlogController {
    static async index(req, res) {
        try {
            const page = parseInt(req.query['page']) || 1;
            const perPage = parseInt(req.query['per_page']) || 10;
            const search = req.query['search'];
            const categoryId = req.query['category_id'];
            const offset = (page - 1) * perPage;
            const whereConditions = {
                is_published: 1
            };
            if (search && search.trim()) {
                whereConditions[sequelize_1.Op.or] = [
                    { title: { [sequelize_1.Op.like]: `%${search}%` } },
                    { author_name: { [sequelize_1.Op.like]: `%${search}%` } },
                    { content: { [sequelize_1.Op.like]: `%${search}%` } }
                ];
            }
            if (categoryId) {
                whereConditions.category_id = parseInt(categoryId);
            }
            const { count, rows: blogs } = await models_1.Blog.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: models_1.BlogCategory,
                        as: 'category',
                        attributes: ['id', 'name', 'slug']
                    }
                ],
                order: [['publish_date', 'DESC']],
                limit: perPage,
                offset: offset,
            });
            const totalPages = Math.ceil(count / perPage);
            return res.json({
                success: true,
                data: {
                    blogs,
                    pagination: {
                        current_page: page,
                        per_page: perPage,
                        total: count,
                        total_pages: totalPages,
                        has_next_page: page < totalPages,
                        has_prev_page: page > 1,
                    },
                },
            });
        }
        catch (error) {
            console.error('Blog index error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const isSlug = isNaN(parseInt(id || '0'));
            let whereCondition;
            if (isSlug) {
                whereCondition = { slug: id };
            }
            else {
                whereCondition = { id: parseInt(id || '0') };
            }
            const blog = await models_1.Blog.findOne({
                where: whereCondition,
                include: [
                    {
                        model: models_1.BlogCategory,
                        as: 'category',
                        attributes: ['id', 'name', 'slug']
                    }
                ],
            });
            if (!blog) {
                return res.status(404).json({ message: 'Blog not found' });
            }
            blog.views += 1;
            await blog.save();
            return res.json({ success: true, data: { blog } });
        }
        catch (error) {
            console.error('Blog show error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async create(req, res) {
        try {
            const { title, author_name, publish_date, read_time, content, keywords, html_content, category_id, is_active } = req.body;
            const slug = (title || '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            const existingBlog = await models_1.Blog.findOne({ where: { slug } });
            if (existingBlog) {
                return res.status(400).json({ message: 'A blog with this title already exists' });
            }
            const blog = await models_1.Blog.create({
                title: title || '',
                slug,
                author_name: author_name || '',
                publish_date: new Date(publish_date),
                read_time: parseInt(read_time || '5'),
                content: content || '',
                html_content: html_content || content || '',
                keywords: keywords || '',
                meta_description: '',
                category_id: parseInt(category_id || '1'),
                is_published: (is_active === '1' || is_active === 1 || is_active === true) ? 1 : 0,
            });
            return res.status(201).json({ success: true, data: { blog } });
        }
        catch (error) {
            console.error('Blog create error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { title, author_name, publish_date, read_time, content, keywords, meta_description, category_id, is_published } = req.body;
            const blog = await models_1.Blog.findByPk(id);
            if (!blog) {
                return res.status(404).json({ message: 'Blog not found' });
            }
            let slug = blog.slug;
            if (title && title !== blog.title) {
                slug = title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                const existingBlog = await models_1.Blog.findOne({ where: { slug, id: { [sequelize_1.Op.ne]: id } } });
                if (existingBlog) {
                    return res.status(400).json({ message: 'A blog with this title already exists' });
                }
            }
            await blog.update({
                title: title || blog.title,
                slug,
                author_name: author_name || blog.author_name,
                publish_date: publish_date ? new Date(publish_date) : blog.publish_date,
                read_time: read_time ? parseInt(read_time) : blog.read_time,
                content: content || blog.content,
                html_content: content || blog.html_content,
                keywords: keywords !== undefined ? keywords : blog.keywords,
                meta_description: meta_description !== undefined ? meta_description : blog.meta_description,
                category_id: category_id ? parseInt(category_id) : blog.category_id,
                is_published: is_published !== undefined ? ((is_published === 'true' || is_published === true) ? 1 : 0) : blog.is_published
            });
            return res.json({ success: true, data: { blog } });
        }
        catch (error) {
            console.error('Blog update error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            const blog = await models_1.Blog.findByPk(id);
            if (!blog) {
                return res.status(404).json({ message: 'Blog not found' });
            }
            await blog.destroy();
            return res.json({ success: true, message: 'Blog deleted successfully' });
        }
        catch (error) {
            console.error('Blog delete error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static uploadHtml(req, res) {
        upload.single('html_file')(req, res, async (err) => {
            try {
                if (err) {
                    return res.status(400).json({ message: err.message });
                }
                if (!req.file) {
                    return res.status(400).json({ message: 'No HTML file uploaded' });
                }
                const { blog_id } = req.params;
                const blog = await models_1.Blog.findByPk(blog_id);
                if (!blog) {
                    return res.status(404).json({ message: 'Blog not found' });
                }
                const htmlContent = fs_1.default.readFileSync(req.file.path, 'utf8');
                await blog.update({
                    html_content: htmlContent
                });
                fs_1.default.unlinkSync(req.file.path);
                return res.json({
                    success: true,
                    message: 'HTML content uploaded successfully',
                    data: { blog }
                });
            }
            catch (error) {
                console.error('Blog upload HTML error:', error);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    static async getCategories(_req, res) {
        try {
            const categories = await models_1.BlogCategory.findAll({
                where: { is_active: true },
                order: [['name', 'ASC']]
            });
            return res.json({ success: true, data: { categories } });
        }
        catch (error) {
            console.error('Blog categories error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getStats(_req, res) {
        try {
            const totalBlogs = await models_1.Blog.count();
            const publishedBlogs = await models_1.Blog.count({ where: { is_published: 1 } });
            const totalViews = await models_1.Blog.sum('views') || 0;
            const totalCategories = await models_1.BlogCategory.count({ where: { is_active: true } });
            const stats = {
                totalBlogs,
                publishedBlogs,
                totalViews,
                totalCategories
            };
            return res.json({ success: true, data: { stats } });
        }
        catch (error) {
            console.error('Blog stats error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.BlogController = BlogController;
//# sourceMappingURL=BlogController.js.map