"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminBlogController = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const imageUtils_1 = require("../utils/imageUtils");
class AdminBlogController {
    static async index(req, res) {
        try {
            const page = parseInt(req.query['page']) || 1;
            const perPage = parseInt(req.query['per_page']) || 10;
            const search = req.query['search'];
            const categoryId = req.query['category_id'];
            const isPublished = req.query['is_published'];
            const offset = (page - 1) * perPage;
            const whereConditions = {};
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
            if (isPublished !== undefined) {
                whereConditions.is_published = isPublished === 'true' ? 1 : 0;
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
                order: [['created_at', 'DESC']],
                limit: perPage,
                offset: offset,
            });
            const processedBlogs = blogs.map(blog => {
                const blogData = blog.toJSON();
                if (blogData.featured_image) {
                    blogData.featured_image = (0, imageUtils_1.convertToWebUrl)(blogData.featured_image, req);
                }
                return blogData;
            });
            const totalPages = Math.ceil(count / perPage);
            return res.json({
                success: true,
                data: {
                    blogs: processedBlogs,
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
            console.error('Admin blog index error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const blog = await models_1.Blog.findOne({
                where: { id: parseInt(id || '0') },
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
            const blogData = blog.toJSON();
            if (blogData.featured_image) {
                blogData.featured_image = (0, imageUtils_1.convertToWebUrl)(blogData.featured_image, req);
            }
            return res.json({ success: true, data: { blog: blogData } });
        }
        catch (error) {
            console.error('Admin blog show error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async create(req, res) {
        try {
            const { title, author_name, publish_date, read_time, content, keywords, html_content, category_id, is_active, image_url } = req.body;
            const slug = (title || '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            const existingBlog = await models_1.Blog.findOne({ where: { slug } });
            if (existingBlog) {
                return res.status(400).json({ message: 'A blog with this title already exists' });
            }
            let featuredImage = null;
            if (req.file) {
                featuredImage = `public/blog-images/${req.file.filename}`;
            }
            else if (image_url) {
                featuredImage = image_url;
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
                featured_image: featuredImage,
                category_id: parseInt(category_id || '1'),
                is_published: (is_active === '1' || is_active === 1 || is_active === true) ? 1 : 0,
            });
            return res.status(201).json({ success: true, data: { blog } });
        }
        catch (error) {
            console.error('Admin blog create error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { title, author_name, publish_date, read_time, content, keywords, meta_description, html_content, category_id, is_published, image_url } = req.body;
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
            let featuredImage = blog.featured_image;
            if (req.file) {
                featuredImage = `public/blog-images/${req.file.filename}`;
                if (blog.featured_image && !blog.featured_image.startsWith('http')) {
                    const oldImagePath = path_1.default.join('public', blog.featured_image);
                    if (fs_1.default.existsSync(oldImagePath)) {
                        fs_1.default.unlinkSync(oldImagePath);
                    }
                }
            }
            else if (image_url !== undefined) {
                featuredImage = image_url;
                if (blog.featured_image && !blog.featured_image.startsWith('http')) {
                    const oldImagePath = path_1.default.join('public', blog.featured_image);
                    if (fs_1.default.existsSync(oldImagePath)) {
                        fs_1.default.unlinkSync(oldImagePath);
                    }
                }
            }
            const updateData = {
                title: title || blog.title,
                slug,
                author_name: author_name || blog.author_name,
                publish_date: publish_date ? new Date(publish_date) : blog.publish_date,
                read_time: read_time ? parseInt(read_time) : blog.read_time,
                content: content || blog.content,
                html_content: html_content || content || blog.html_content,
                keywords: keywords !== undefined ? keywords : blog.keywords,
                meta_description: meta_description !== undefined ? meta_description : blog.meta_description,
                category_id: category_id ? parseInt(category_id) : blog.category_id,
                is_published: is_published !== undefined ? parseInt(is_published) : blog.is_published
            };
            if (featuredImage !== undefined) {
                updateData.featured_image = featuredImage;
            }
            await blog.update(updateData);
            return res.json({ success: true, data: { blog } });
        }
        catch (error) {
            console.error('Admin blog update error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.query;
            if (status === undefined || status === null) {
                return res.status(400).json({ error: 'Status is required.' });
            }
            const blog = await models_1.Blog.findByPk(id);
            if (!blog) {
                return res.status(404).json({ error: 'Blog not found' });
            }
            const statusValue = Array.isArray(status) ? status[0] : status;
            blog.is_published = (String(statusValue) === '1' || String(statusValue) === 'true') ? 1 : 0;
            await blog.save();
            return res.json({
                success: true,
                message: 'Blog status updated successfully',
                data: { blog }
            });
        }
        catch (error) {
            console.error('Admin update blog status error:', error);
            return res.status(500).json({ error: 'Server error' });
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
            console.error('Admin blog delete error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getCategories(_req, res) {
        try {
            const categories = await models_1.BlogCategory.findAll({
                order: [['name', 'ASC']]
            });
            return res.json({ success: true, data: { categories } });
        }
        catch (error) {
            console.error('Admin blog categories error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async createCategory(req, res) {
        try {
            const { name, description } = req.body;
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            const existingCategory = await models_1.BlogCategory.findOne({ where: { slug } });
            if (existingCategory) {
                return res.status(400).json({ message: 'A category with this name already exists' });
            }
            const category = await models_1.BlogCategory.create({
                name,
                slug,
                description: description || '',
                is_active: 1
            });
            return res.status(201).json({ success: true, data: { category } });
        }
        catch (error) {
            console.error('Admin create category error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { name, description, is_active } = req.body;
            const category = await models_1.BlogCategory.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            let slug = category.slug;
            if (name && name !== category.name) {
                slug = name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                const existingCategory = await models_1.BlogCategory.findOne({ where: { slug, id: { [sequelize_1.Op.ne]: id } } });
                if (existingCategory) {
                    return res.status(400).json({ message: 'A category with this name already exists' });
                }
            }
            await category.update({
                name: name || category.name,
                slug,
                description: description !== undefined ? description : category.description,
                is_active: is_active !== undefined ? is_active : category.is_active
            });
            return res.json({ success: true, data: { category } });
        }
        catch (error) {
            console.error('Admin update category error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async destroyCategory(req, res) {
        try {
            const { id } = req.params;
            const category = await models_1.BlogCategory.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            const blogCount = await models_1.Blog.count({ where: { category_id: id } });
            if (blogCount > 0) {
                return res.status(400).json({ message: 'Cannot delete category with existing blogs' });
            }
            await category.destroy();
            return res.json({ success: true, message: 'Category deleted successfully' });
        }
        catch (error) {
            console.error('Admin delete category error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.AdminBlogController = AdminBlogController;
//# sourceMappingURL=AdminBlogController.js.map