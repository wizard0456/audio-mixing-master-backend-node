"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCategoryController = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const database_1 = __importDefault(require("../config/database"));
class AdminCategoryController {
    static async index(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 10;
            const page = parseInt(req.query['page']) || 1;
            const isActive = req.query['is_active'];
            const whereConditions = {};
            if (isActive === 'active') {
                whereConditions.is_active = 1;
            }
            else if (isActive === 'inactive') {
                whereConditions.is_active = 0;
            }
            const { count, rows: categories } = await Category_1.default.findAndCountAll({
                where: whereConditions,
                order: [['id', 'DESC']],
                limit: perPage,
                offset: (page - 1) * perPage,
            });
            const totalPages = Math.ceil(count / perPage);
            return res.json({
                data: categories,
                current_page: page,
                per_page: perPage,
                total: count,
                last_page: totalPages,
                from: (page - 1) * perPage + 1,
                to: Math.min(page * perPage, count),
            });
        }
        catch (error) {
            console.error('Get categories error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async store(req, res) {
        const transaction = await database_1.default.transaction();
        try {
            const { name } = req.body;
            if (!name || name.length > 255) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Name required and maximum 255 characters.' });
            }
            const category = await Category_1.default.create({
                name,
                is_active: 1,
            }, { transaction });
            await transaction.commit();
            return res.json(category);
        }
        catch (error) {
            await transaction.rollback();
            console.error('Create category error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const category = await Category_1.default.findByPk(id);
            if (!category) {
                return res.status(404).json({ error: 'No data found' });
            }
            return res.json(category);
        }
        catch (error) {
            console.error('Get category error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, is_active } = req.query;
            const nameStr = name;
            const isActive = parseInt(is_active);
            if (!nameStr || nameStr.length > 255) {
                return res.status(400).json({ error: 'Name required and maximum 255 characters.' });
            }
            const category = await Category_1.default.findByPk(id);
            if (!category) {
                return res.status(404).json({ error: 'No data found' });
            }
            await category.update({
                name: nameStr,
                is_active: isActive,
            });
            return res.json(category);
        }
        catch (error) {
            console.error('Update category error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async destroy(req, res) {
        const transaction = await database_1.default.transaction();
        try {
            const { id } = req.params;
            const category = await Category_1.default.findByPk(id);
            if (!category) {
                await transaction.rollback();
                return res.status(404).json({ error: 'No data found' });
            }
            await category.destroy({ transaction });
            await transaction.commit();
            return res.json('Deleted');
        }
        catch (error) {
            await transaction.rollback();
            console.error('Delete category error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.query;
            if (status === undefined || status === null) {
                return res.status(400).json({ error: 'Status required.' });
            }
            const category = await Category_1.default.findByPk(id);
            if (!category) {
                return res.status(404).json({ error: 'No data found' });
            }
            await category.update({ is_active: parseInt(status) });
            return res.json(category);
        }
        catch (error) {
            console.error('Update category status error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
exports.AdminCategoryController = AdminCategoryController;
//# sourceMappingURL=AdminCategoryController.js.map