"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const models_1 = require("../models");
class OrderController {
    static async index(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const page = parseInt(req.query['page']) || 1;
            const perPage = parseInt(req.query['per_page']) || 10;
            const offset = (page - 1) * perPage;
            const whereConditions = { user_id: userId };
            const { count, rows: orders } = await models_1.Order.findAndCountAll({
                where: whereConditions,
                include: [
                    { model: models_1.OrderItem, as: 'orderItems', include: [{ model: models_1.Service, as: 'service' }] },
                ],
                order: [['created_at', 'DESC']],
                limit: perPage,
                offset: offset,
            });
            const totalPages = Math.ceil(count / perPage);
            return res.json({
                success: true,
                data: {
                    orders,
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
            console.error('Order index error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const order = await models_1.Order.findOne({
                where: { id, user_id: userId },
                include: [
                    { model: models_1.OrderItem, as: 'orderItems', include: [{ model: models_1.Service, as: 'service' }] },
                ],
            });
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            const revisions = await models_1.Revision.findAll({
                where: { order_id: id },
                order: [['created_at', 'DESC']]
            });
            return res.json({
                success: true,
                data: {
                    order: {
                        ...order.toJSON(),
                        revisions: revisions
                    }
                }
            });
        }
        catch (error) {
            console.error('Order show error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async create(req, res) {
        try {
            const userId = req.user?.id;
            const { amount, currency, order_type } = req.body;
            const order = await models_1.Order.create({
                user_id: userId,
                transaction_id: `TXN_${Date.now()}`,
                amount,
                currency: currency || 'USD',
                order_type,
                Order_status: 0,
            });
            return res.status(201).json({ success: true, data: { order } });
        }
        catch (error) {
            console.error('Order create error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { Order_status } = req.body;
            const userId = req.user?.id;
            const order = await models_1.Order.findOne({ where: { id, user_id: userId } });
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            order.Order_status = Order_status;
            await order.save();
            return res.json({ success: true, data: { order } });
        }
        catch (error) {
            console.error('Order updateStatus error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getStats(req, res) {
        try {
            const userId = req.user.id;
            const totalOrders = await models_1.Order.count({ where: { user_id: userId } });
            const totalSpent = await models_1.Order.sum('amount', { where: { user_id: userId } });
            const averageOrderValue = totalSpent ? totalSpent / totalOrders : 0;
            const stats = {
                totalOrders,
                totalSpent,
                averageOrderValue,
            };
            return res.json({
                success: true,
                data: { stats },
            });
        }
        catch (error) {
            console.error('Order stats error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.OrderController = OrderController;
//# sourceMappingURL=OrderController.js.map