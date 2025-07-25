"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminTagController = void 0;
const models_1 = require("../models");
const database_1 = __importDefault(require("../config/database"));
class AdminTagController {
    static async index(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 10;
            const page = parseInt(req.query['page']) || 1;
            const isActive = req.query['is_active'];
            const offset = (page - 1) * perPage;
            let whereClause = {};
            if (isActive === 'active') {
                whereClause.is_active = 1;
            }
            else if (isActive === 'inactive') {
                whereClause.is_active = 0;
            }
            const { count, rows } = await models_1.Tag.findAndCountAll({
                where: whereClause,
                order: [['id', 'DESC']],
                limit: perPage,
                offset: offset,
            });
            const totalPages = Math.ceil(count / perPage);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;
            const data = {
                data: rows,
                current_page: page,
                per_page: perPage,
                total: count,
                total_pages: totalPages,
                has_next_page: hasNextPage,
                has_prev_page: hasPrevPage,
            };
            return res.json(data);
        }
        catch (error) {
            console.error('Error in AdminTagController.index:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const tag = await models_1.Tag.findByPk(id);
            if (!tag) {
                return res.status(404).json({ error: 'No data found' });
            }
            return res.json(tag);
        }
        catch (error) {
            console.error('Error in AdminTagController.show:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async store(req, res) {
        const transaction = await database_1.default.transaction();
        try {
            const { tag_name } = req.body;
            if (!tag_name || tag_name.trim().length === 0) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Tag Name required.' });
            }
            if (tag_name.length > 255) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Tag Name maximum 255 characters.' });
            }
            const tag = await models_1.Tag.create({
                tag_name: tag_name.trim(),
            }, { transaction });
            await transaction.commit();
            return res.json(tag);
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error in AdminTagController.store:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { tag_name, is_active } = req.query;
            const tagNameStr = tag_name;
            const isActive = is_active === '1' || is_active === 'true';
            if (!tagNameStr || tagNameStr.trim().length === 0) {
                return res.status(400).json({ error: 'Tag Name required.' });
            }
            if (tagNameStr.length > 255) {
                return res.status(400).json({ error: 'Tag Name maximum 255 characters.' });
            }
            const tag = await models_1.Tag.findByPk(id);
            if (!tag) {
                return res.status(404).json({ error: 'No data found' });
            }
            tag.tag_name = tagNameStr.trim();
            if (is_active !== undefined) {
                tag.is_active = isActive;
            }
            await tag.save();
            return res.json(tag);
        }
        catch (error) {
            console.error('Error in AdminTagController.update:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async destroy(req, res) {
        const transaction = await database_1.default.transaction();
        try {
            const { id } = req.params;
            const tag = await models_1.Tag.findByPk(id);
            if (!tag) {
                await transaction.rollback();
                return res.status(404).json({ error: 'No data found' });
            }
            await tag.destroy({ transaction });
            await transaction.commit();
            return res.json('Deleted');
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error in AdminTagController.destroy:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.AdminTagController = AdminTagController;
//# sourceMappingURL=AdminTagController.js.map