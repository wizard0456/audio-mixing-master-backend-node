"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceController = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
class ServiceController {
    static async index(req, res) {
        try {
            const page = parseInt(req.query['page']) || 1;
            const perPage = parseInt(req.query['per_page']) || 10;
            const offset = (page - 1) * perPage;
            const where = { is_active: 1 };
            const { count, rows: services } = await models_1.Service.findAndCountAll({
                where,
                include: [
                    {
                        model: models_1.Category,
                        as: 'category',
                    },
                    {
                        model: models_1.Label,
                        as: 'label',
                        attributes: ['id', 'name'],
                    },
                ],
                offset,
                limit: perPage,
                order: [['created_at', 'DESC']],
            });
            const lastPage = Math.ceil(count / perPage);
            const servicesWithNames = services.map((service) => {
                const serviceData = service.toJSON();
                const { label, category } = serviceData;
                return {
                    id: serviceData.id.toString(),
                    parent_id: serviceData.parent_id.toString(),
                    category_id: serviceData.category_id.toString(),
                    image: serviceData.image,
                    is_url: serviceData.is_url.toString(),
                    name: serviceData.name,
                    service_type: serviceData.service_type,
                    price: serviceData.price ? serviceData.price.toString() : "0",
                    discounted_price: serviceData.discounted_price ? serviceData.discounted_price.toString() : "0",
                    label_id: serviceData.label_id.toString(),
                    tags: serviceData.tags || "",
                    paypal_product_id: serviceData.paypal_product_id,
                    paypal_plan_id: serviceData.paypal_plan_id,
                    stripe_plan_id: serviceData.stripe_plan_id,
                    stripe_product_id: serviceData.stripe_product_id,
                    label_name: label ? label.name : null,
                    category_name: category ? category.name : null,
                    is_variation: serviceData.is_variation.toString(),
                };
            });
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
            return res.json({
                current_page: page,
                data: servicesWithNames,
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
            console.error('Service index error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getServiceDetails(req, res) {
        try {
            const { id } = req.params;
            const service = await models_1.Service.findOne({
                where: { id, is_active: 1 },
                include: [
                    {
                        model: models_1.Category,
                        as: 'category',
                    },
                    {
                        model: models_1.Label,
                        as: 'label',
                    },
                ],
            });
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }
            let variations = [];
            if (service.parent_id === 0) {
                variations = await models_1.Service.findAll({
                    where: {
                        parent_id: service.id,
                        is_active: 1
                    },
                    order: [['createdAt', 'ASC']],
                });
            }
            const serviceData = service.toJSON();
            const formattedService = {
                id: serviceData.id,
                category_id: serviceData.category_id,
                label_id: serviceData.label_id,
                parent_id: serviceData.parent_id,
                paypal_product_id: serviceData.paypal_product_id,
                paypal_plan_id: serviceData.paypal_plan_id,
                stripe_product_id: serviceData.stripe_product_id,
                stripe_plan_id: serviceData.stripe_plan_id,
                name: serviceData.name,
                image: serviceData.image,
                is_url: serviceData.is_url,
                price: serviceData.price,
                discounted_price: serviceData.discounted_price,
                service_type: serviceData.service_type,
                detail: serviceData.detail,
                brief_detail: serviceData.brief_detail,
                includes: serviceData.includes,
                description: serviceData.description,
                requirements: serviceData.requirements,
                notes: serviceData.notes,
                tags: serviceData.tags,
                is_active: serviceData.is_active,
                is_variation: serviceData.is_variation,
                detail_data: serviceData.detail_data,
                is_session: serviceData.is_session,
                created_at: serviceData.createdAt,
                updated_at: serviceData.updatedAt,
                variation: variations,
                category: serviceData.category,
                label: serviceData.label,
            };
            return res.json(formattedService);
        }
        catch (error) {
            console.error('Service details error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const tagSlug = req.params['tag'];
            const page = parseInt(req.query['page']) || 1;
            const perPage = parseInt(req.query['per_page']) || 10;
            const offset = (page - 1) * perPage;
            const tagName = tagSlug?.replace(/-/g, ' ') || '';
            const tag = await models_1.Tag.findOne({
                where: {
                    tag_name: tagName,
                    is_active: 1
                }
            });
            if (!tag) {
                return res.status(404).json({
                    message: `Tag not found: ${tagName}`,
                    tag: tagName
                });
            }
            let where = {
                is_active: 1,
                is_variation: 0
            };
            where.tags = { [sequelize_1.Op.like]: `%${tag.tag_name}%` };
            const { count, rows: services } = await models_1.Service.findAndCountAll({
                where,
                include: [
                    {
                        model: models_1.Category,
                        as: 'category',
                    },
                    {
                        model: models_1.Label,
                        as: 'label',
                        attributes: ['id', 'name'],
                    },
                ],
                offset,
                limit: perPage,
                order: [['created_at', 'DESC']],
            });
            if (!services || services.length === 0) {
                return res.status(404).json({
                    message: `No services found for tag: ${tag.tag_name}`,
                    tag: tag.tag_name,
                    tag_slug: tagSlug
                });
            }
            const lastPage = Math.ceil(count / perPage);
            const servicesWithNames = services.map((service) => {
                const serviceData = service.toJSON();
                const { label, category } = serviceData;
                return {
                    id: serviceData.id.toString(),
                    parent_id: serviceData.parent_id.toString(),
                    category_id: serviceData.category_id.toString(),
                    image: serviceData.image,
                    is_url: serviceData.is_url.toString(),
                    name: serviceData.name,
                    service_type: serviceData.service_type,
                    price: serviceData.price ? serviceData.price.toString() : "0",
                    discounted_price: serviceData.discounted_price ? serviceData.discounted_price.toString() : "0",
                    label_id: serviceData.label_id.toString(),
                    tags: serviceData.tags || "",
                    paypal_product_id: serviceData.paypal_product_id,
                    paypal_plan_id: serviceData.paypal_plan_id,
                    stripe_plan_id: serviceData.stripe_plan_id,
                    stripe_product_id: serviceData.stripe_product_id,
                    label_name: label ? label.name : null,
                    category_name: category ? category.name : null,
                    is_variation: serviceData.is_variation.toString(),
                };
            });
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
            return res.json({
                current_page: page,
                data: servicesWithNames,
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
            console.error('Service show error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getVariations(req, res) {
        try {
            const { id } = req.params;
            const service = await models_1.Service.findByPk(id);
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }
            const variations = await models_1.Service.findAll({
                where: {
                    category_id: service.category_id,
                    id: { [sequelize_1.Op.ne]: id },
                    is_active: 1,
                },
                include: [
                    {
                        model: models_1.Category,
                        as: 'category',
                    },
                ],
                limit: 5,
                order: [['createdAt', 'DESC']],
            });
            return res.json({
                success: true,
                data: { variations },
            });
        }
        catch (error) {
            console.error('Service variations error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async search(req, res) {
        try {
            const { q, page = 1, limit = 10 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            if (!q) {
                return res.status(400).json({ message: 'Search query is required' });
            }
            const where = {
                status: 'ACTIVE',
                [sequelize_1.Op.or]: [
                    { name: { [sequelize_1.Op.like]: `%${q}%` } },
                    { description: { [sequelize_1.Op.like]: `%${q}%` } },
                ],
            };
            const services = await models_1.Service.findAndCountAll({
                where,
                include: [
                    {
                        model: models_1.Category,
                        as: 'category',
                    },
                ],
                offset,
                limit: parseInt(limit),
                order: [['createdAt', 'DESC']],
            });
            return res.json({
                success: true,
                data: {
                    services: services.rows,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: services.count,
                        pages: Math.ceil(services.count / parseInt(limit)),
                    },
                },
            });
        }
        catch (error) {
            console.error('Service search error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getByCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const page = parseInt(req.query['page']) || 1;
            const perPage = parseInt(req.query['per_page']) || 10;
            const offset = (page - 1) * perPage;
            const where = {
                category_id: categoryId,
                is_active: 1,
                parent_id: 0,
            };
            const { count, rows: services } = await models_1.Service.findAndCountAll({
                where,
                include: [
                    {
                        model: models_1.Category,
                        as: 'category',
                    },
                    {
                        model: models_1.Label,
                        as: 'label',
                        attributes: ['id', 'name'],
                    },
                ],
                offset,
                limit: perPage,
                order: [['createdAt', 'DESC']],
            });
            const lastPage = Math.ceil(count / perPage);
            const servicesWithNames = services.map((service) => {
                const serviceData = service.toJSON();
                const { label, category } = serviceData;
                return {
                    id: serviceData.id.toString(),
                    parent_id: serviceData.parent_id.toString(),
                    category_id: serviceData.category_id.toString(),
                    image: serviceData.image,
                    is_url: serviceData.is_url.toString(),
                    name: serviceData.name,
                    service_type: serviceData.service_type,
                    price: serviceData.price ? serviceData.price.toString() : "0",
                    discounted_price: serviceData.discounted_price ? serviceData.discounted_price.toString() : "0",
                    label_id: serviceData.label_id.toString(),
                    tags: serviceData.tags || "",
                    paypal_product_id: serviceData.paypal_product_id,
                    paypal_plan_id: serviceData.paypal_plan_id,
                    stripe_plan_id: serviceData.stripe_plan_id,
                    stripe_product_id: serviceData.stripe_product_id,
                    label_name: label ? label.name : null,
                    category_name: category ? category.name : null,
                    is_variation: serviceData.is_variation.toString(),
                };
            });
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
            return res.json({
                current_page: page,
                data: servicesWithNames,
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
            console.error('Service by category error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.ServiceController = ServiceController;
//# sourceMappingURL=ServiceController.js.map