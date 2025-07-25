"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOrderController = void 0;
const models_1 = require("../models");
const EmailService_1 = require("../services/EmailService");
const sequelize_1 = require("sequelize");
const models_2 = require("../models");
class AdminOrderController {
    static async index(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 10;
            const page = parseInt(req.query['page']) || 1;
            const status = req.query['order_status'];
            const offset = (page - 1) * perPage;
            const search = req.query['search'];
            const whereConditions = {};
            if (search && search.trim()) {
                const users = await models_1.User.findAll({
                    where: {
                        [sequelize_1.Op.or]: [
                            { first_name: { [sequelize_1.Op.like]: `%${search}%` } },
                            { last_name: { [sequelize_1.Op.like]: `%${search}%` } },
                            { email: { [sequelize_1.Op.like]: `%${search}%` } }
                        ]
                    },
                    attributes: ['id']
                });
                const userIds = users.map(user => user.id);
                whereConditions[sequelize_1.Op.or] = [
                    { transaction_id: { [sequelize_1.Op.like]: `%${search}%` } },
                    { order_type: { [sequelize_1.Op.like]: `%${search}%` } },
                    { payment_method: { [sequelize_1.Op.like]: `%${search}%` } },
                    { order_reference_id: { [sequelize_1.Op.like]: `%${search}%` } },
                    ...(userIds.length > 0 ? [{ user_id: { [sequelize_1.Op.in]: userIds } }] : [])
                ];
            }
            if (status) {
                whereConditions.Order_status = parseInt(status);
            }
            const { count, rows: orders } = await models_1.Order.findAndCountAll({
                where: whereConditions,
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
                limit: perPage,
                offset: offset,
            });
            const lastPage = Math.ceil(count / perPage);
            const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
            const firstPageUrl = `${baseUrl}?page=1`;
            const lastPageUrl = `${baseUrl}?page=${lastPage}`;
            const nextPageUrl = page < lastPage ? `${baseUrl}?page=${page + 1}` : null;
            const prevPageUrl = page > 1 ? `${baseUrl}?page=${page - 1}` : null;
            const links = [];
            links.push({
                url: prevPageUrl,
                label: "&laquo; Previous",
                active: false
            });
            for (let i = 1; i <= lastPage; i++) {
                links.push({
                    url: i === 1 ? baseUrl : `${baseUrl}?page=${i}`,
                    label: i.toString(),
                    active: i === page
                });
            }
            links.push({
                url: nextPageUrl,
                label: "Next &raquo;",
                active: false
            });
            const transformedOrders = orders.map(order => ({
                id: order.id,
                user_id: order.user_id,
                transaction_id: order.transaction_id,
                amount: order.amount,
                currency: order.currency,
                promocode: order.promocode,
                payer_name: order.payer_name,
                payer_email: order.payer_email,
                payment_status: order.payment_status,
                Order_status: order.Order_status,
                order_type: order.order_type,
                is_active: order.is_active,
                payment_method: order.payment_method,
                order_reference_id: order.order_reference_id,
                created_at: order.createdAt,
                updated_at: order.updatedAt,
                user: order.user ? {
                    id: order.user.id,
                    first_name: order.user.first_name,
                    last_name: order.user.last_name,
                    email: order.user.email
                } : null,
                order_items: order.orderItems ? order.orderItems.map(item => ({
                    id: item.id,
                    order_id: item.order_id,
                    service_id: item.service_id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    max_revision: item.max_revision,
                    total_price: item.total_price,
                    service_type: item.service_type,
                    paypal_product_id: item.paypal_product_id,
                    paypal_plan_id: item.paypal_plan_id,
                    admin_is_read: item.admin_is_read,
                    user_is_read: item.user_is_read,
                    service: item.service ? {
                        id: item.service.id,
                        name: item.service.name,
                        price: item.service.price
                    } : null
                })) : []
            }));
            return res.json({
                current_page: page,
                data: transformedOrders,
                first_page_url: firstPageUrl,
                from: ((page - 1) * perPage) + 1,
                last_page: lastPage,
                last_page_url: lastPageUrl,
                links: links,
                next_page_url: nextPageUrl,
                path: baseUrl,
                per_page: perPage,
                prev_page_url: prevPageUrl,
                to: Math.min(page * perPage, count),
                total: count,
            });
        }
        catch (error) {
            console.error('Admin get orders error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const order = await models_1.Order.findOne({
                where: { id },
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
            });
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            const [orderCoupons, revisions] = await Promise.all([
                models_2.OrderCoupon.findAll({ where: { order_id: id } }),
                models_2.Revision.findAll({ where: { order_id: id } })
            ]);
            const transformedResponse = {
                order: {
                    id: order.id,
                    user_id: order.user_id,
                    transaction_id: order.transaction_id,
                    amount: order.amount,
                    currency: order.currency,
                    promocode: order.promocode,
                    payer_name: order.payer_name,
                    payer_email: order.payer_email,
                    payment_status: order.payment_status,
                    Order_status: order.Order_status,
                    order_type: order.order_type,
                    is_active: order.is_active,
                    payment_method: order.payment_method,
                    order_reference_id: order.order_reference_id,
                    created_at: order.createdAt,
                    updated_at: order.updatedAt,
                },
                order_items: order.orderItems ? order.orderItems.map(item => ({
                    id: item.id,
                    order_id: item.order_id,
                    service_id: item.service_id,
                    paypal_product_id: item.paypal_product_id,
                    paypal_plan_id: item.paypal_plan_id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    total_price: item.total_price,
                    service_type: item.service_type,
                    max_revision: item.max_revision,
                    deliverable_files: item.deliverable_files,
                    admin_is_read: item.admin_is_read,
                    user_is_read: item.user_is_read,
                    created_at: item.createdAt,
                    updated_at: item.updatedAt,
                })) : [],
                coupon: orderCoupons.length > 0 ? orderCoupons[0] : null,
                user_name: order.user ? `${order.user.first_name} ${order.user.last_name}` : '',
                user_email: order.user ? order.user.email : '',
                revision: revisions,
                is_giftcard: 0,
            };
            return res.json(transformedResponse);
        }
        catch (error) {
            console.error('Admin get order error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async orderUpdateFile(req, res) {
        try {
            const { id } = req.params;
            const { order_item_id, deliverable_links } = req.body;
            const order = await models_1.Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ error: 'No data found' });
            }
            const user = await models_1.User.findByPk(order.user_id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const orderItem = await models_1.OrderItem.findByPk(order_item_id);
            if (!orderItem) {
                return res.status(404).json({ error: 'No data item found' });
            }
            let orderStatusMessage = '';
            if (deliverable_links && (Array.isArray(deliverable_links) ? deliverable_links.length > 0 : deliverable_links.trim() !== '')) {
                order.Order_status = 2;
                switch (order.Order_status) {
                    case 0:
                        orderStatusMessage = 'Pending';
                        break;
                    case 1:
                        orderStatusMessage = 'In Process';
                        break;
                    case 2:
                        orderStatusMessage = 'Delivered';
                        break;
                    case 3:
                        orderStatusMessage = 'Canceled';
                        break;
                    default:
                        orderStatusMessage = 'Unknown';
                        break;
                }
                const deliverableLinks = [];
                if (orderItem.deliverable_files) {
                    try {
                        const existingLinks = JSON.parse(orderItem.deliverable_files);
                        if (Array.isArray(existingLinks)) {
                            deliverableLinks.push(...existingLinks);
                        }
                    }
                    catch (error) {
                        console.error('Error parsing existing deliverable files:', error);
                    }
                }
                if (Array.isArray(deliverable_links)) {
                    deliverableLinks.push(...deliverable_links);
                }
                else {
                    const links = deliverable_links.split(/[,\n]/).map((link) => link.trim()).filter((link) => link !== '');
                    deliverableLinks.push(...links);
                }
                orderItem.deliverable_files = JSON.stringify(deliverableLinks);
                orderItem.user_is_read = 0;
                try {
                    (0, EmailService_1.sendOrderStatusEmail)({
                        email: user.email,
                        name: `${user.first_name} ${user.last_name}`,
                        order_id: Number(id),
                        status: orderStatusMessage,
                        url: `${process.env['FRONTEND_URL']}/order/${id}`,
                        message: `Your project is now ${orderStatusMessage}! You can view the latest changes or additions in your panel`
                    });
                }
                catch (emailError) {
                    console.error('Error sending email to user:', emailError);
                }
                try {
                    const admin = await models_1.User.findOne({ where: { role: 'admin' } });
                    if (admin) {
                        (0, EmailService_1.sendOrderStatusEmail)({
                            email: admin.email,
                            name: `${admin.first_name} ${admin.last_name}`,
                            order_id: Number(id),
                            status: orderStatusMessage,
                            url: `${process.env['ADMIN_URL'] || 'http://localhost:3000'}/order-detail/${id}`,
                            message: 'Your Order has been Delivered successfully. Now you can check the details by clicking the button below:'
                        });
                    }
                }
                catch (emailError) {
                    console.error('Error sending email to admin:', emailError);
                }
            }
            await order.save();
            await orderItem.save();
            return res.status(200).json({
                Order_status: order.Order_status,
                order_item: orderItem
            });
        }
        catch (error) {
            console.error('Order update file error:', error);
            let status = 500;
            if (error instanceof Error) {
                if (error.message.includes('No data found') || error.message.includes('not found')) {
                    status = 404;
                }
                else if (error.message.includes('constraint') || error.message.includes('duplicate')) {
                    status = 400;
                }
            }
            return res.status(status).json({
                error: error instanceof Error ? error.message : 'Server error'
            });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { order_status } = req.body;
            console.log(req.body);
            if (order_status === undefined || order_status === null) {
                return res.status(400).json({ error: 'Order status is required.' });
            }
            const order = await models_1.Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            if (req.user) {
                const userRole = req.user.role?.toUpperCase();
                if (userRole === 'ENGINEER' && order.user_id !== req.user.id) {
                    return res.status(403).json({ error: 'Access denied. You can only modify your own orders.' });
                }
            }
            order.Order_status = order_status;
            await order.save();
            return res.json(order);
        }
        catch (error) {
            console.error('Admin update order status error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            const order = await models_1.Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            if (req.user) {
                const userRole = req.user.role?.toUpperCase();
                if (userRole === 'ENGINEER' && order.user_id !== req.user.id) {
                    return res.status(403).json({ error: 'Access denied. You can only delete your own orders.' });
                }
            }
            await order.destroy();
            return res.json('Deleted');
        }
        catch (error) {
            console.error('Admin delete order error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
exports.AdminOrderController = AdminOrderController;
//# sourceMappingURL=AdminOrderController.js.map