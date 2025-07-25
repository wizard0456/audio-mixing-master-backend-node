"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminServiceController = void 0;
const models_1 = require("../models");
const database_1 = __importDefault(require("../config/database"));
const sequelize_1 = require("sequelize");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class AdminServiceController {
    static async index(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 10;
            const page = parseInt(req.query['page']) || 1;
            const isActive = req.query['is_active'];
            const type = req.query['type'];
            const offset = (page - 1) * perPage;
            let whereClause = { parent_id: 0 };
            if (isActive === 'active') {
                whereClause.is_active = 1;
            }
            else if (isActive === 'inactive') {
                whereClause.is_active = 0;
            }
            if (type === 'one_time') {
                whereClause.price = { [sequelize_1.Op.ne]: null };
            }
            else if (type === 'monthly') {
                whereClause.monthly_price = { [sequelize_1.Op.ne]: null };
            }
            const { count, rows } = await models_1.Service.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: models_1.Category,
                        as: 'category',
                        where: { is_active: 1 },
                        required: false,
                    },
                    {
                        model: models_1.Label,
                        as: 'label',
                        where: { is_active: 1 },
                        required: false,
                    },
                ],
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
            console.error('Error in AdminServiceController.index:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const service = await models_1.Service.findOne({
                where: { id },
                include: [
                    {
                        model: models_1.Category,
                        as: 'category',
                        where: { is_active: 1 },
                        required: false,
                    },
                    {
                        model: models_1.Label,
                        as: 'label',
                        where: { is_active: 1 },
                        required: false,
                    },
                ],
            });
            if (!service) {
                return res.status(404).json({ error: 'No data found' });
            }
            const subServices = await models_1.Service.findAll({
                where: { parent_id: id, is_active: 1 },
            });
            if (subServices.length > 0) {
                service.variation = subServices;
            }
            return res.json(service);
        }
        catch (error) {
            console.error('Error in AdminServiceController.show:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async store(req, res) {
        const transaction = await database_1.default.transaction();
        try {
            const { category_id, label_id, name, one_time_price, one_time_discounted_price, monthly_price, monthly_discounted_price, detail, brief_detail, includes, description, requirements, notes, tags, service_option, is_variation, product_variation, is_url, is_active, image } = req.body;
            if (!category_id) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Category required.' });
            }
            if (!label_id) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Label required.' });
            }
            if (!name || name.trim().length === 0) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Name required.' });
            }
            if (name.length > 255) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Name maximum 255 characters.' });
            }
            if (!detail || detail.trim().length === 0) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Detail required.' });
            }
            if (!service_option) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Service option required.' });
            }
            if (is_variation === 1 && !product_variation) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Variations of product required' });
            }
            let imageName = '';
            if (is_url === 0 && req.file) {
                const imageFile = req.file;
                imageName = `service_image_${Date.now()}.${imageFile.originalname.split('.').pop()}`;
                const uploadDir = path_1.default.join(process.cwd(), 'public', 'service-images');
                if (!fs_1.default.existsSync(uploadDir)) {
                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                }
                const filePath = path_1.default.join(uploadDir, imageName);
                fs_1.default.writeFileSync(filePath, imageFile.buffer);
                imageName = `service-images/${imageName}`;
            }
            else if (is_url === 1 && image) {
                imageName = image;
            }
            let parentId = 0;
            if (service_option === 'oneTime') {
                const service = await models_1.Service.create({
                    category_id,
                    label_id,
                    parent_id: 0,
                    name: name.trim(),
                    image: imageName,
                    service_type: 'one_time',
                    price: one_time_price,
                    discounted_price: one_time_discounted_price || 0,
                    detail: detail.trim(),
                    brief_detail: brief_detail || null,
                    includes: includes || null,
                    description: description || null,
                    requirements: requirements || null,
                    notes: notes || null,
                    tags: tags || null,
                    is_url: is_url || 0,
                    is_active: is_active !== undefined ? is_active : 1,
                    is_variation: is_variation || 0,
                }, { transaction });
                parentId = service.id;
                if (is_variation === 1 && product_variation) {
                    try {
                        const variations = JSON.parse(product_variation);
                        if (Array.isArray(variations) && variations.length > 0) {
                            for (const variation of variations) {
                                await models_1.Service.create({
                                    category_id,
                                    parent_id: parentId,
                                    label_id,
                                    name: variation.name,
                                    image: imageName,
                                    service_type: 'one_time',
                                    price: variation.price,
                                    discounted_price: variation.discounted_price || 0,
                                    detail: detail.trim(),
                                    brief_detail: brief_detail || null,
                                    includes: includes || null,
                                    description: description || null,
                                    requirements: requirements || null,
                                    notes: notes || null,
                                    tags: tags || null,
                                    is_url: is_url || 0,
                                    is_active: is_active !== undefined ? is_active : 1,
                                    is_variation: 0,
                                }, { transaction });
                            }
                        }
                    }
                    catch (error) {
                        await transaction.rollback();
                        return res.status(400).json({ error: 'Invalid product variation format.' });
                    }
                }
            }
            else if (service_option === 'monthly') {
                await models_1.Service.create({
                    category_id,
                    label_id,
                    parent_id: 0,
                    name: name.trim(),
                    image: imageName,
                    service_type: 'subscription',
                    price: monthly_price,
                    discounted_price: monthly_discounted_price || 0,
                    detail: detail.trim(),
                    brief_detail: brief_detail || null,
                    includes: includes || null,
                    description: description || null,
                    requirements: requirements || null,
                    notes: notes || null,
                    tags: tags || null,
                    is_url: is_url || 0,
                    is_active: is_active !== undefined ? is_active : 1,
                }, { transaction });
            }
            else if (service_option === 'both') {
                const oneTimeService = await models_1.Service.create({
                    category_id,
                    label_id,
                    parent_id: 0,
                    name: name.trim(),
                    image: imageName,
                    service_type: 'one_time',
                    price: one_time_price,
                    discounted_price: one_time_discounted_price || 0,
                    detail: detail.trim(),
                    brief_detail: brief_detail || null,
                    includes: includes || null,
                    description: description || null,
                    requirements: requirements || null,
                    notes: notes || null,
                    tags: tags || null,
                    is_url: is_url || 0,
                    is_active: is_active !== undefined ? is_active : 1,
                }, { transaction });
                parentId = oneTimeService.id;
                await models_1.Service.create({
                    category_id,
                    label_id,
                    parent_id: 0,
                    name: name.trim(),
                    image: imageName,
                    service_type: 'subscription',
                    price: monthly_price,
                    discounted_price: monthly_discounted_price || 0,
                    detail: detail.trim(),
                    brief_detail: brief_detail || null,
                    includes: includes || null,
                    description: description || null,
                    requirements: requirements || null,
                    notes: notes || null,
                    tags: tags || null,
                    is_url: is_url || 0,
                    is_active: is_active !== undefined ? is_active : 1,
                }, { transaction });
            }
            await transaction.commit();
            return res.json({ status: 'success' });
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error in AdminServiceController.store:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { category_id, label_id, name, one_time_price, one_time_discounted_price, monthly_price, monthly_discounted_price, detail, brief_detail, includes, description, requirements, notes, tags, service_option, image, is_url, is_active, is_variation, product_variation, } = req.body;
            if (!category_id) {
                return res.status(400).json({ error: 'Category required.' });
            }
            if (!label_id) {
                return res.status(400).json({ error: 'Label required.' });
            }
            if (!name || name.trim().length === 0) {
                return res.status(400).json({ error: 'Name required.' });
            }
            if (name.length > 255) {
                return res.status(400).json({ error: 'Name maximum 255 characters.' });
            }
            if (!detail || detail.trim().length === 0) {
                return res.status(400).json({ error: 'Detail required.' });
            }
            if (!service_option) {
                return res.status(400).json({ error: 'Service option required.' });
            }
            const service = await models_1.Service.findByPk(id);
            if (!service) {
                return res.status(404).json({ error: 'No data found' });
            }
            if (is_url === 0 && req.file) {
                const imageFile = req.file;
                const imageName = `service_image_${Date.now()}.${imageFile.originalname.split('.').pop()}`;
                const uploadDir = path_1.default.join(process.cwd(), 'public', 'service-images');
                if (!fs_1.default.existsSync(uploadDir)) {
                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                }
                const filePath = path_1.default.join(uploadDir, imageName);
                fs_1.default.writeFileSync(filePath, imageFile.buffer);
                service.image = `service-images/${imageName}`;
            }
            else if (is_url === 1 && image) {
                service.image = image;
            }
            if (service_option === 'oneTime') {
                service.service_type = 'one_time';
                service.price = one_time_price;
                service.discounted_price = one_time_discounted_price || null;
            }
            else if (service_option === 'monthly') {
                service.service_type = 'subscription';
                service.price = monthly_price;
                service.discounted_price = monthly_discounted_price || null;
            }
            service.category_id = category_id;
            service.label_id = label_id;
            service.name = name.trim();
            service.detail = detail.trim();
            service.brief_detail = brief_detail || null;
            service.includes = includes || null;
            service.description = description || null;
            service.requirements = requirements || null;
            service.notes = notes || null;
            service.tags = tags || null;
            service.is_variation = is_variation || 0;
            service.is_url = is_url || 0;
            service.is_active = is_active !== undefined ? is_active : 1;
            await service.save();
            if (is_variation === 1 && product_variation) {
                try {
                    const variations = JSON.parse(product_variation);
                    if (Array.isArray(variations) && variations.length > 0) {
                        const variationIdsFromRequest = variations
                            .map((v) => v.id)
                            .filter((id) => id != null);
                        await models_1.Service.update({ is_active: 0 }, {
                            where: {
                                parent_id: parseInt(id || '0'),
                                id: { [sequelize_1.Op.notIn]: variationIdsFromRequest }
                            }
                        });
                        for (const variation of variations) {
                            if (variation.id) {
                                const existingVariation = await models_1.Service.findByPk(variation.id);
                                if (existingVariation) {
                                    existingVariation.name = variation.name;
                                    existingVariation.price = variation.price;
                                    existingVariation.discounted_price = variation.discounted_price || 0;
                                    existingVariation.is_active = 1;
                                    await existingVariation.save();
                                }
                            }
                            else {
                                await models_1.Service.create({
                                    category_id,
                                    parent_id: parseInt(id || '0'),
                                    label_id,
                                    name: variation.name,
                                    image: service.image,
                                    service_type: 'one_time',
                                    price: variation.price,
                                    discounted_price: variation.discounted_price || 0,
                                    detail: detail.trim(),
                                    brief_detail: brief_detail || null,
                                    includes: includes || null,
                                    description: description || null,
                                    requirements: requirements || null,
                                    notes: notes || null,
                                    tags: tags || null,
                                    is_url: is_url || 0,
                                    is_active: 1,
                                    is_variation: 0,
                                });
                            }
                        }
                    }
                }
                catch (error) {
                    return res.status(400).json({ error: 'Invalid product variation format.' });
                }
            }
            else {
                await models_1.Service.update({ is_active: 0 }, { where: { parent_id: parseInt(id || '0') } });
                service.is_variation = 0;
                await service.save();
            }
            return res.json({ status: 'success' });
        }
        catch (error) {
            console.error('Error in AdminServiceController.update:', error);
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
            const service = await models_1.Service.findByPk(id);
            if (!service) {
                return res.status(404).json({ error: 'No data found' });
            }
            service.is_active = status ? 1 : 0;
            await service.save();
            return res.json(service);
        }
        catch (error) {
            console.error('Error in AdminServiceController.updateStatus:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            const service = await models_1.Service.findByPk(id);
            if (!service) {
                return res.status(404).json({ error: 'No data found' });
            }
            if (service.parent_id && service.parent_id !== 0) {
                const parentService = await models_1.Service.findByPk(service.parent_id);
                if (parentService) {
                    await parentService.destroy();
                }
            }
            await service.destroy();
            return res.json('Deleted');
        }
        catch (error) {
            console.error('Error in AdminServiceController.destroy:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async serviceList(_req, res) {
        try {
            const services = await models_1.Service.findAll();
            if (services.length === 0) {
                return res.status(200).json([]);
            }
            return res.json(services);
        }
        catch (error) {
            console.error('Error in AdminServiceController.serviceList:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.AdminServiceController = AdminServiceController;
//# sourceMappingURL=AdminServiceController.js.map