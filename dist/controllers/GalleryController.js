"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryController = void 0;
const models_1 = require("../models");
class GalleryController {
    static async index(_req, res) {
        try {
            const galleries = await models_1.Gallery.findAll({
                where: { is_active: 1 },
                order: [['created_at', 'DESC']],
            });
            if (galleries.length === 0) {
                return res.status(404).json({ error: 'No data found.' });
            }
            const formattedGalleries = galleries.map((gallery) => {
                const galleryData = gallery.toJSON();
                return {
                    id: galleryData.id,
                    image: galleryData.image,
                    is_active: galleryData.is_active,
                    created_at: galleryData.createdAt,
                    updated_at: galleryData.updatedAt,
                };
            });
            return res.json(formattedGalleries);
        }
        catch (error) {
            console.error('Gallery index error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const gallery = await models_1.Gallery.findOne({
                where: { id, is_active: 1 },
            });
            if (!gallery) {
                return res.status(404).json({ error: 'No data found.' });
            }
            const galleryData = gallery.toJSON();
            const formattedGallery = {
                id: galleryData.id,
                image: galleryData.image,
                is_active: galleryData.is_active,
                created_at: galleryData.createdAt,
                updated_at: galleryData.updatedAt,
            };
            return res.json(formattedGallery);
        }
        catch (error) {
            console.error('Gallery show error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
exports.GalleryController = GalleryController;
//# sourceMappingURL=GalleryController.js.map