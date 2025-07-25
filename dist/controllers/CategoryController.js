"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const models_1 = require("../models");
const database_1 = __importDefault(require("../config/database"));
class CategoryController {
    static async index(_req, res) {
        try {
            const categories = await models_1.Category.findAll({
                where: { is_active: 1 },
                include: [
                    {
                        model: models_1.Service,
                        as: 'services',
                        where: { is_active: 1 },
                        required: false,
                        attributes: [],
                    },
                ],
                attributes: {
                    include: [
                        [
                            database_1.default.literal(`(
                SELECT COUNT(*)
                FROM services
                WHERE services.category_id = Category.id
                AND services.is_active = 1
              )`),
                            'serviceCount',
                        ],
                    ],
                },
                order: [['created_at', 'DESC']],
            });
            return res.json({ success: true, data: { categories } });
        }
        catch (error) {
            console.error('Category index error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const category = await models_1.Category.findOne({
                where: { id, is_active: 1 },
                include: [
                    {
                        model: models_1.Service,
                        as: 'services',
                        where: { is_active: 1 },
                        required: false,
                    },
                ],
            });
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            return res.json({ success: true, data: { category } });
        }
        catch (error) {
            console.error('Category show error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getWithServices(_req, res) {
        try {
            const categories = await models_1.Category.findAll({
                where: { is_active: 1 },
                attributes: ['id', 'name', 'is_active'],
                include: [
                    {
                        model: models_1.Service,
                        as: 'services',
                        where: { is_active: 1, parent_id: 0 },
                        required: false,
                        attributes: [
                            'id',
                            'category_id',
                            'image',
                            'name',
                            'service_type',
                            'price',
                            'discounted_price',
                            'label_id',
                            'paypal_product_id',
                            'stripe_plan_id',
                            'paypal_plan_id',
                        ],
                        include: [
                            {
                                model: models_1.Label,
                                as: 'label',
                                required: false,
                                attributes: ['id', 'name', 'is_active'],
                                where: { is_active: 1 },
                            },
                        ],
                    },
                ],
                order: [['id', 'ASC']],
            });
            if (!categories || categories.length === 0) {
                return res.status(200).json({ message: 'No data found.' });
            }
            return res.json(categories);
        }
        catch (error) {
            console.error('Category getWithServices error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=CategoryController.js.map