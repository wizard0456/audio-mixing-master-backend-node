"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelController = void 0;
const models_1 = require("../models");
class ExcelController {
    static async exportOrders(_req, res) {
        try {
            const orders = await models_1.Order.findAll({
                include: [
                    {
                        model: models_1.User,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name', 'email'],
                    },
                    {
                        model: models_1.OrderItem,
                        as: 'orderItems',
                        include: [
                            {
                                model: models_1.Service,
                                as: 'service',
                                attributes: ['id', 'name', 'price'],
                            },
                        ],
                    },
                ],
                order: [['id', 'DESC']],
            });
            const csvData = orders.map(order => {
                const data = order.toJSON();
                return Object.values(data).join(',');
            }).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
            return res.send(csvData);
        }
        catch (error) {
            console.error('ExcelController exportOrders error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.ExcelController = ExcelController;
//# sourceMappingURL=ExcelController.js.map