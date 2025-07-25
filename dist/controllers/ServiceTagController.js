"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceTagController = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
class ServiceTagController {
    static async index(_req, res) {
        try {
            const allTags = await models_1.Tag.findAll({
                where: { is_active: 1 },
                order: [['id', 'ASC']]
            });
            const totalServices = await models_1.Service.count({
                where: {
                    is_active: 1,
                    is_variation: 0
                }
            });
            const tags = [
                {
                    tag: "All",
                    slug: "all",
                    count: totalServices
                }
            ];
            for (const tag of allTags) {
                const serviceCount = await models_1.Service.count({
                    where: {
                        is_active: 1,
                        is_variation: 0,
                        tags: { [sequelize_1.Op.like]: `%${tag.tag_name}%` }
                    }
                });
                const slug = tag.tag_name.toLowerCase().replace(/\s+/g, '-');
                tags.push({
                    tag: tag.tag_name,
                    slug: slug,
                    count: serviceCount
                });
            }
            return res.json(tags);
        }
        catch (error) {
            console.error('ServiceTag index error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const tag = await models_1.Tag.findOne({
                where: { id, is_active: 1 },
            });
            if (!tag) {
                return res.status(404).json({ message: 'Tag not found' });
            }
            const serviceCount = await models_1.Service.count({
                where: {
                    is_active: 1,
                    is_variation: 0,
                    tags: { [sequelize_1.Op.like]: `%${tag.tag_name}%` }
                }
            });
            const slug = tag.tag_name.toLowerCase().replace(/\s+/g, '-');
            return res.json({
                ...tag.toJSON(),
                slug: slug,
                count: serviceCount
            });
        }
        catch (error) {
            console.error('ServiceTag show error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.ServiceTagController = ServiceTagController;
//# sourceMappingURL=ServiceTagController.js.map