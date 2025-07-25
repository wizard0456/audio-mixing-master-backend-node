"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLabelController = void 0;
const models_1 = require("../models");
const database_1 = __importDefault(require("../config/database"));
class AdminLabelController {
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
            const { count, rows } = await models_1.Label.findAndCountAll({
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
            console.error('Error in AdminLabelController.index:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const label = await models_1.Label.findByPk(id);
            if (!label) {
                return res.status(404).json({ error: 'No data found' });
            }
            return res.json(label);
        }
        catch (error) {
            console.error('Error in AdminLabelController.show:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async store(req, res) {
        const transaction = await database_1.default.transaction();
        try {
            const { name } = req.body;
            if (!name || name.trim().length === 0) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Name required.' });
            }
            if (name.length > 255) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Name maximum 255 characters.' });
            }
            const label = await models_1.Label.create({
                name: name.trim(),
            }, { transaction });
            await transaction.commit();
            return res.json(label);
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error in AdminLabelController.store:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, is_active } = req.query;
            const nameStr = name;
            if (!nameStr || nameStr.trim().length === 0) {
                return res.status(400).json({ error: 'Name is required.' });
            }
            if (nameStr.length > 255) {
                return res.status(400).json({ error: 'Name must be 255 characters or fewer.' });
            }
            const label = await models_1.Label.findByPk(id);
            if (!label) {
                return res.status(404).json({ error: 'Label not found.' });
            }
            label.name = nameStr.trim();
            if (typeof is_active !== 'undefined') {
                label.is_active = (is_active === '1' || is_active === 'true') ? 1 : 0;
            }
            await label.save();
            return res.json(label);
        }
        catch (error) {
            console.error('Error in AdminLabelController.update:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async destroy(req, res) {
        const transaction = await database_1.default.transaction();
        try {
            const { id } = req.params;
            const label = await models_1.Label.findByPk(id);
            if (!label) {
                await transaction.rollback();
                return res.status(404).json({ error: 'No data found' });
            }
            await label.destroy({ transaction });
            await transaction.commit();
            return res.json('Deleted');
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error in AdminLabelController.destroy:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.AdminLabelController = AdminLabelController;
//# sourceMappingURL=AdminLabelController.js.map