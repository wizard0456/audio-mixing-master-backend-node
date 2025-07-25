"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCouponController = void 0;
const models_1 = require("../models");
const database_1 = __importDefault(require("../config/database"));
class AdminCouponController {
    static async index(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 10;
            const page = parseInt(req.query['page']) || 1;
            const isActive = req.query['is_active'];
            const offset = (page - 1) * perPage;
            const whereConditions = {};
            if (isActive === 'active') {
                whereConditions.is_active = 1;
            }
            else if (isActive === 'inactive') {
                whereConditions.is_active = 0;
            }
            const { count, rows: coupons } = await models_1.Coupon.findAndCountAll({
                where: whereConditions,
                order: [['id', 'DESC']],
                limit: perPage,
                offset: offset,
            });
            const totalPages = Math.ceil(count / perPage);
            return res.json({
                data: coupons,
                current_page: page,
                per_page: perPage,
                total: count,
                last_page: totalPages,
                from: offset + 1,
                to: Math.min(offset + perPage, count),
            });
        }
        catch (error) {
            console.error('Get coupons error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async store(req, res) {
        const transaction = await database_1.default.transaction();
        try {
            const { code, discount_type, discount_value, max_uses, start_date, end_date, is_active, coupon_type, product_ids } = req.body;
            if (!code || !/^[a-zA-Z0-9]+$/.test(code) || code.length > 50) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Code is required, must be alphanumeric, and maximum 50 characters.' });
            }
            if (!discount_type || !['percentage', 'fixed'].includes(discount_type)) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Discount type must be either percentage or fixed.' });
            }
            if (!discount_value || isNaN(discount_value)) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Discount value is required and must be numeric.' });
            }
            if (max_uses !== undefined && max_uses !== null && isNaN(max_uses)) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Max uses must be numeric.' });
            }
            if (!start_date || !/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Start date is required and must be in Y-m-d format.' });
            }
            if (end_date && !/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
                await transaction.rollback();
                return res.status(400).json({ error: 'End date must be in Y-m-d format.' });
            }
            if (end_date && new Date(end_date) <= new Date(start_date)) {
                await transaction.rollback();
                return res.status(400).json({ error: 'End date must be after start date.' });
            }
            if (coupon_type === undefined || coupon_type === null) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Coupon type is required.' });
            }
            const coupon = await models_1.Coupon.create({
                code,
                discount_type,
                discount_value,
                max_uses: max_uses || null,
                uses: 0,
                start_date,
                end_date: end_date || null,
                is_active: is_active,
                coupon_type,
                product_ids: (product_ids && coupon_type === 1) ? JSON.stringify(product_ids) : null,
            }, { transaction });
            await transaction.commit();
            return res.json(coupon);
        }
        catch (error) {
            await transaction.rollback();
            console.error('Create coupon error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const coupon = await models_1.Coupon.findByPk(id);
            if (!coupon) {
                return res.status(404).json({ error: 'Coupon not found' });
            }
            return res.json(coupon);
        }
        catch (error) {
            console.error('Get coupon error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { code, discount_type, discount_value, max_uses, start_date, end_date, is_active, coupon_type, product_ids } = req.body;
            if (!code || !/^[a-zA-Z0-9]+$/.test(code) || code.length > 50) {
                return res.status(400).json({ error: 'Code is required, must be alphanumeric, and maximum 50 characters.' });
            }
            if (!discount_type || !['percentage', 'fixed'].includes(discount_type)) {
                return res.status(400).json({ error: 'Discount type must be either percentage or fixed.' });
            }
            if (!discount_value || isNaN(discount_value)) {
                return res.status(400).json({ error: 'Discount value is required and must be numeric.' });
            }
            if (max_uses !== undefined && max_uses !== null && isNaN(max_uses)) {
                return res.status(400).json({ error: 'Max uses must be numeric.' });
            }
            if (!start_date || !/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
                return res.status(400).json({ error: 'Start date is required and must be in Y-m-d format.' });
            }
            if (end_date && !/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
                return res.status(400).json({ error: 'End date must be in Y-m-d format.' });
            }
            if (end_date && new Date(end_date) <= new Date(start_date)) {
                return res.status(400).json({ error: 'End date must be after start date.' });
            }
            if (coupon_type === undefined || coupon_type === null) {
                return res.status(400).json({ error: 'Coupon type is required.' });
            }
            if (is_active === undefined || is_active === null) {
                return res.status(400).json({ error: 'Coupon status is required.' });
            }
            const coupon = await models_1.Coupon.findByPk(id);
            if (!coupon) {
                return res.status(404).json({ error: 'Coupon not found' });
            }
            await coupon.update({
                code,
                discount_type,
                discount_value,
                max_uses: max_uses || null,
                start_date,
                end_date: end_date || null,
                is_active: is_active,
                coupon_type,
                product_ids: (product_ids && coupon_type === 1) ? JSON.stringify(product_ids) : null,
            });
            return res.json(coupon);
        }
        catch (error) {
            console.error('Update coupon error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async destroy(req, res) {
        const transaction = await database_1.default.transaction();
        try {
            const { id } = req.params;
            const coupon = await models_1.Coupon.findByPk(id);
            if (!coupon) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Coupon not found' });
            }
            await coupon.destroy({ transaction });
            await transaction.commit();
            return res.json('Deleted');
        }
        catch (error) {
            console.error('Delete coupon error:', error);
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
            const coupon = await models_1.Coupon.findByPk(id);
            if (!coupon) {
                return res.status(404).json({ error: 'Coupon not found' });
            }
            await coupon.update({ is_active: parseInt(status) });
            return res.json(coupon);
        }
        catch (error) {
            console.error('Update coupon status error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
exports.AdminCouponController = AdminCouponController;
//# sourceMappingURL=AdminCouponController.js.map