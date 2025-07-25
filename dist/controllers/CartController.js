"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const models_1 = require("../models");
class CartController {
    static async index(req, res) {
        try {
            const userId = req.user?.id;
            const cartItems = await models_1.Cart.findAll({
                where: { user_id: userId },
                include: [{ model: models_1.Service, as: 'service' }],
                order: [['createdAt', 'DESC']],
            });
            return res.json({ success: true, data: { cartItems } });
        }
        catch (error) {
            console.error('Cart index error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async add(req, res) {
        try {
            const userId = req.user?.id;
            const { id: serviceId, qty, price, total_price } = req.body.services[0];
            let cartItem = await models_1.Cart.findOne({ where: { user_id: userId, service_id: serviceId } });
            if (cartItem) {
                cartItem.qty = (parseInt(cartItem.qty) + parseInt(qty)).toString();
                cartItem.total_price = (parseFloat(cartItem.total_price) + parseFloat(total_price)).toString();
                await cartItem.save();
            }
            else {
                cartItem = await models_1.Cart.create({
                    user_id: userId,
                    service_id: serviceId,
                    qty,
                    price,
                    total_price
                });
            }
            const allCartItems = await models_1.Cart.findAll({
                where: { user_id: userId },
                include: [{ model: models_1.Service, as: 'service' }],
                order: [['createdAt', 'DESC']]
            });
            const transformedCartItems = allCartItems.map(item => ({
                id: item.id,
                user_id: item.user_id,
                service_id: item.service_id,
                price: item.price,
                qty: item.qty,
                total_price: item.total_price,
                created_at: item.createdAt,
                updated_at: item.updatedAt,
                name: item.service?.name,
                service_type: item.service?.service_type,
                paypal_plan_id: item.service?.paypal_plan_id,
                paypal_product_id: item.service?.paypal_product_id
            }));
            return res.status(200).json(transformedCartItems);
        }
        catch (error) {
            console.error('Cart add error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async update(req, res) {
        try {
            const userId = req.user?.id;
            const serviceId = req.params['serviceId'];
            const { qty, price, total_price } = req.body;
            const cartItem = await models_1.Cart.findOne({ where: { user_id: userId, service_id: serviceId } });
            if (!cartItem) {
                return res.status(404).json({ message: 'Cart item not found' });
            }
            cartItem.qty = qty;
            cartItem.price = price;
            cartItem.total_price = total_price;
            await cartItem.save();
            return res.json({ success: true, data: { cartItem } });
        }
        catch (error) {
            console.error('Cart update error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async remove(req, res) {
        try {
            const userId = req.user?.id;
            const serviceId = req.params['serviceId'];
            const cartItem = await models_1.Cart.findOne({ where: { user_id: userId, service_id: serviceId } });
            if (!cartItem) {
                return res.status(404).json({ message: 'Cart item not found' });
            }
            await cartItem.destroy();
            return res.json({ success: true, message: 'Cart item removed' });
        }
        catch (error) {
            console.error('Cart remove error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.CartController = CartController;
//# sourceMappingURL=CartController.js.map