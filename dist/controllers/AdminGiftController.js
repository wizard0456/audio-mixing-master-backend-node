"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGiftController = void 0;
const models_1 = require("../models");
const database_1 = __importDefault(require("../config/database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class AdminGiftController {
    static async index(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 10;
            const page = parseInt(req.query['page']) || 1;
            const offset = (page - 1) * perPage;
            const { count, rows } = await models_1.Gift.findAndCountAll({
                order: [['id', 'DESC']],
                limit: perPage,
                offset: offset,
            });
            if (rows.length === 0) {
                return res.status(404).json({ error: 'No data found' });
            }
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
            console.error('Error in AdminGiftController.index:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const gift = await models_1.Gift.findByPk(id);
            if (!gift) {
                return res.status(404).json({ error: 'No data found' });
            }
            return res.json(gift);
        }
        catch (error) {
            console.error('Error in AdminGiftController.show:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async store(req, res) {
        const transaction = await database_1.default.transaction();
        try {
            const { name, price, details } = req.body;
            if (!name || name.trim().length === 0) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Name required.' });
            }
            if (name.length > 255) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Name maximum 255 characters.' });
            }
            if (!price || isNaN(Number(price))) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Price required.' });
            }
            if (isNaN(Number(price))) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Price numeric.' });
            }
            const giftData = {
                name: name.trim(),
                price: Number(price),
                details: details || null,
            };
            if (req.file) {
                const imageName = `gift_image_${Date.now()}.${req.file.originalname.split('.').pop()}`;
                const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'gift-images');
                if (!fs_1.default.existsSync(uploadDir)) {
                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                }
                const filePath = path_1.default.join(uploadDir, imageName);
                fs_1.default.writeFileSync(filePath, req.file.buffer);
                giftData.image = `gift-images/${imageName}`;
            }
            const gift = await models_1.Gift.create(giftData, { transaction });
            await transaction.commit();
            return res.json(gift);
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error in AdminGiftController.store:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, price, details } = req.body;
            if (!name || name.trim().length === 0) {
                return res.status(400).json({ error: 'Name required.' });
            }
            if (name.length > 255) {
                return res.status(400).json({ error: 'Name maximum 255 characters.' });
            }
            if (!price || isNaN(Number(price))) {
                return res.status(400).json({ error: 'Price required.' });
            }
            if (isNaN(Number(price))) {
                return res.status(400).json({ error: 'Price numeric.' });
            }
            const gift = await models_1.Gift.findByPk(id);
            if (!gift) {
                return res.status(404).json({ error: 'No data found' });
            }
            if (req.file) {
                if (gift.image) {
                    const oldImagePath = path_1.default.join(process.cwd(), 'uploads', gift.image);
                    if (fs_1.default.existsSync(oldImagePath)) {
                        fs_1.default.unlinkSync(oldImagePath);
                    }
                }
                const imageName = `gift_image_${Date.now()}.${req.file.originalname.split('.').pop()}`;
                const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'gift-images');
                if (!fs_1.default.existsSync(uploadDir)) {
                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                }
                const filePath = path_1.default.join(uploadDir, imageName);
                fs_1.default.writeFileSync(filePath, req.file.buffer);
                gift.image = `gift-images/${imageName}`;
            }
            gift.name = name.trim();
            gift.price = Number(price);
            gift.details = details || null;
            await gift.save();
            return res.json(gift);
        }
        catch (error) {
            console.error('Error in AdminGiftController.update:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const statusParam = req.query['status'];
            if (statusParam === undefined || statusParam === null) {
                return res.status(400).json({ error: 'Status required.' });
            }
            const status = statusParam === '1' ? true : false;
            if (typeof status !== 'boolean') {
                return res.status(400).json({ error: 'Status must be a boolean value.' });
            }
            const gift = await models_1.Gift.findByPk(id);
            if (!gift) {
                return res.status(404).json({ error: 'No data found' });
            }
            gift.is_active = status;
            await gift.save();
            return res.json(gift);
        }
        catch (error) {
            console.error('Error in AdminGiftController.updateStatus:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async destroy(req, res) {
        const transaction = await database_1.default.transaction();
        try {
            const { id } = req.params;
            const gift = await models_1.Gift.findByPk(id);
            if (!gift) {
                await transaction.rollback();
                return res.status(404).json({ error: 'No data found' });
            }
            if (gift.image) {
                const imagePath = path_1.default.join(process.cwd(), 'uploads', gift.image);
                if (fs_1.default.existsSync(imagePath)) {
                    fs_1.default.unlinkSync(imagePath);
                }
            }
            await gift.destroy({ transaction });
            await transaction.commit();
            return res.json('Deleted');
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error in AdminGiftController.destroy:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.AdminGiftController = AdminGiftController;
//# sourceMappingURL=AdminGiftController.js.map