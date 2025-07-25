"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.RevisionController = void 0;
const models_1 = require("../models");
const EmailService_1 = require("../services/EmailService");
const uuid_1 = require("uuid");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = 'public/order-revision-files';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueName = `revision_file_${Date.now()}_${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({ storage });
exports.upload = upload;
class RevisionController {
    static async store(req, res) {
        try {
            const { order_id, service_id, message, transaction_id } = req.body;
            if (!order_id || !service_id || !message) {
                return res.status(400).json({
                    error: 'Order ID, service ID, and message are required'
                });
            }
            const orderItem = await models_1.OrderItem.findOne({
                where: {
                    service_id: service_id,
                    order_id: order_id
                }
            });
            if (!orderItem) {
                return res.status(404).json({ error: 'Order item not found' });
            }
            if (orderItem.max_revision <= 0) {
                return res.status(404).json({ error: 'Max revision reached' });
            }
            let revision;
            if (transaction_id) {
                revision = await models_1.Revision.findOne({
                    where: {
                        service_id: service_id,
                        order_id: order_id,
                        transaction_id: transaction_id
                    }
                });
                if (revision) {
                    revision.message = message;
                    revision.admin_is_read = 0;
                    await revision.save();
                }
            }
            if (!revision) {
                revision = await models_1.Revision.create({
                    order_id: order_id,
                    service_id: service_id,
                    user_id: req.user.id,
                    message: message,
                    status: 'pending',
                    admin_is_read: 0,
                    user_is_read: 0
                });
            }
            orderItem.max_revision = orderItem.max_revision - 1;
            await orderItem.save();
            const order = await models_1.Order.findByPk(order_id);
            if (order) {
                order.Order_status = 4;
                await order.save();
            }
            const user = await models_1.User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const userUrl = process.env['FRONTEND_URL'];
            const adminUrl = process.env['ADMIN_URL'];
            (0, EmailService_1.sendRevisionSuccessEmail)({
                name: `${user.first_name} ${user.last_name}`,
                order_id: order_id,
                service_id: service_id,
                amount: 0,
                url: `${userUrl}/order/${order_id}`,
                message: 'Your Revision Request has been sent Successfully. Our Engineers are working on it:',
                email: user.email
            });
            const admin = await models_1.User.findOne({ where: { role: 'admin' } });
            if (admin) {
                (0, EmailService_1.sendRevisionSuccessEmail)({
                    name: `${admin.first_name} ${admin.last_name}`,
                    order_id: order_id,
                    service_id: service_id,
                    amount: 0,
                    url: `${adminUrl}/order-detail/${order_id}`,
                    message: 'New Revision Request has been Arrived Successfully. All the Engineer has been notified:',
                    email: admin.email
                });
            }
            const engineers = await models_1.User.findAll({ where: { role: 'engineer' } });
            for (const engineer of engineers) {
                (0, EmailService_1.sendRevisionSuccessEmail)({
                    name: `${engineer.first_name} ${engineer.last_name}`,
                    order_id: order_id,
                    service_id: service_id,
                    amount: 0,
                    url: `${adminUrl}/order-detail/${order_id}`,
                    message: 'New Revision Request has been Arrived Successfully. You can check by clicking the link below:',
                    email: engineer.email
                });
            }
            const allRevisions = await models_1.Revision.findAll({
                where: { order_id: order_id }
            });
            return res.json({
                message: 'success',
                Order_status: 4,
                max_count: orderItem.max_revision,
                revision: allRevisions
            });
        }
        catch (error) {
            console.error('Revision store error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({ error: errorMessage });
        }
    }
    static async upload(req, res) {
        try {
            const { id } = req.params;
            const { links } = req.body;
            if (!links || !Array.isArray(links) || links.length === 0) {
                return res.status(400).json({ error: 'Links array is required' });
            }
            const revision = await models_1.Revision.findByPk(id);
            if (!revision) {
                return res.status(404).json({ error: 'No data found' });
            }
            let existingFiles = [];
            if (revision.files) {
                try {
                    existingFiles = JSON.parse(revision.files);
                }
                catch (e) {
                    existingFiles = [];
                }
            }
            const allFiles = [...existingFiles, ...links];
            revision.files = JSON.stringify(allFiles);
            const order = await models_1.Order.findByPk(revision.order_id);
            if (order) {
                order.Order_status = 2;
                await order.save();
            }
            revision.user_is_read = 0;
            await revision.save();
            const user = await models_1.User.findByPk(revision.user_id);
            if (user) {
                const userUrl = process.env['FRONTEND_URL'];
                const adminUrl = process.env['ADMIN_URL'];
                (0, EmailService_1.sendRevisionSuccessEmail)({
                    name: `${user.first_name} ${user.last_name}`,
                    order_id: revision.order_id,
                    service_id: revision.service_id,
                    amount: 0,
                    url: `${userUrl}/order/${revision.order_id}`,
                    message: 'Your Revision File has been Delivered Successfully:',
                    email: user.email
                });
                const admin = await models_1.User.findOne({ where: { role: 'admin' } });
                if (admin) {
                    (0, EmailService_1.sendRevisionSuccessEmail)({
                        name: `${admin.first_name} ${admin.last_name}`,
                        order_id: revision.order_id,
                        service_id: revision.service_id,
                        amount: 0,
                        url: `${adminUrl}/order-detail/${revision.order_id}`,
                        message: 'New Revision file has been Arrived Successfully:',
                        email: admin.email
                    });
                }
            }
            const allRevisions = await models_1.Revision.findAll({
                where: { order_id: revision.order_id }
            });
            return res.json({
                revision: allRevisions,
                order_status: 2
            });
        }
        catch (error) {
            console.error('Revision upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({ error: errorMessage });
        }
    }
    static async flagAdmin(req, res) {
        try {
            const { id } = req.params;
            const { admin_is_read, order_item_id, type } = req.body;
            let adminIsRead;
            if (typeof admin_is_read === 'string') {
                adminIsRead = admin_is_read === '1' || admin_is_read === 'true';
            }
            else if (typeof admin_is_read === 'boolean') {
                adminIsRead = admin_is_read;
            }
            else {
                return res.status(400).json({ error: 'Admin Is Read status must be a valid boolean or string' });
            }
            if (!order_item_id) {
                return res.status(400).json({ error: 'Order item ID is required' });
            }
            if (!type || !['order', 'revision'].includes(type)) {
                return res.status(400).json({ error: 'Type must be either order or revision' });
            }
            let data = null;
            let response = null;
            if (type === 'order') {
                data = await models_1.OrderItem.findOne({
                    where: {
                        order_id: id,
                        id: order_item_id
                    }
                });
            }
            else if (type === 'revision') {
                const orderItem = await models_1.OrderItem.findOne({
                    where: {
                        order_id: id,
                        id: order_item_id
                    }
                });
                if (orderItem) {
                    data = await models_1.Revision.findOne({
                        where: {
                            order_id: id,
                            service_id: orderItem.service_id,
                            admin_is_read: 0
                        }
                    });
                }
            }
            if (!data) {
                return res.status(404).json({ error: 'No data found' });
            }
            data.admin_is_read = adminIsRead ? 1 : 0;
            await data.save();
            if (type === 'order') {
                response = await models_1.OrderItem.findAll({
                    where: { order_id: id }
                });
            }
            else if (type === 'revision') {
                response = await models_1.Revision.findAll({
                    where: { order_id: id }
                });
            }
            return res.json(response);
        }
        catch (error) {
            console.error('Flag admin error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({ error: errorMessage });
        }
    }
    static async flagUser(req, res) {
        try {
            const { id } = req.params;
            const { user_is_read, order_item_id, type } = req.body;
            let userIsRead;
            if (typeof user_is_read === 'string') {
                userIsRead = user_is_read === '1' || user_is_read === 'true';
            }
            else if (typeof user_is_read === 'boolean') {
                userIsRead = user_is_read;
            }
            else {
                return res.status(400).json({ error: 'User Is Read status must be a valid boolean or string' });
            }
            if (!order_item_id) {
                return res.status(400).json({ error: 'Order Item ID is required' });
            }
            if (!type || !['order', 'revision'].includes(type)) {
                return res.status(400).json({ error: 'Type must be either order or revision' });
            }
            let data = null;
            let response = null;
            if (type === 'order') {
                data = await models_1.OrderItem.findOne({
                    where: {
                        order_id: id,
                        id: order_item_id
                    }
                });
            }
            else if (type === 'revision') {
                const orderItem = await models_1.OrderItem.findOne({
                    where: {
                        order_id: id,
                        id: order_item_id
                    }
                });
                if (orderItem) {
                    data = await models_1.Revision.findOne({
                        where: {
                            order_id: id,
                            service_id: orderItem.service_id,
                            user_is_read: 0
                        }
                    });
                }
            }
            if (!data) {
                return res.status(404).json({ error: 'No data found' });
            }
            data.user_is_read = userIsRead ? 1 : 0;
            await data.save();
            if (type === 'order') {
                response = await models_1.OrderItem.findAll({
                    where: { order_id: id }
                });
            }
            else if (type === 'revision') {
                response = await models_1.Revision.findAll({
                    where: { order_id: id }
                });
            }
            return res.json(response);
        }
        catch (error) {
            console.error('Flag user error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({ error: errorMessage });
        }
    }
    static async getData(_req, res) {
        try {
            return res.json({ message: 'Revision data endpoint' });
        }
        catch (error) {
            console.error('Get revision data error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({ error: errorMessage });
        }
    }
}
exports.RevisionController = RevisionController;
//# sourceMappingURL=RevisionController.js.map