"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGalleryController = void 0;
const Gallery_1 = __importDefault(require("../models/Gallery"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class AdminGalleryController {
    static async index(_req, res) {
        try {
            const galleries = await Gallery_1.default.findAll({
                order: [['id', 'DESC']],
            });
            if (galleries.length === 0) {
                return res.status(404).json({ error: 'No data found' });
            }
            return res.json(galleries);
        }
        catch (error) {
            console.error('Get galleries error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async store(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Image required.' });
            }
            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                return res.status(400).json({ error: 'Image must be a valid image file.' });
            }
            const timestamp = Date.now();
            const fileExtension = path_1.default.extname(req.file.originalname);
            const fileName = `image_${timestamp}${fileExtension}`;
            const uploadDir = path_1.default.join(process.cwd(), 'public', 'gallary-images');
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            const filePath = path_1.default.join(uploadDir, fileName);
            fs_1.default.writeFileSync(filePath, req.file.buffer);
            const gallery = await Gallery_1.default.create({
                image: `gallary-images/${fileName}`,
                is_active: 1,
            });
            return res.json(gallery);
        }
        catch (error) {
            console.error('Create gallery error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const gallery = await Gallery_1.default.findByPk(id);
            if (!gallery) {
                return res.status(404).json({ error: 'No data found' });
            }
            return res.json(gallery);
        }
        catch (error) {
            console.error('Get gallery error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.query;
            if (status === undefined || status === null) {
                return res.status(400).json({ error: 'Status required.' });
            }
            if (typeof status !== 'boolean') {
                return res.status(400).json({ error: 'Invalid status.' });
            }
            const gallery = await Gallery_1.default.findByPk(id);
            if (!gallery) {
                return res.status(404).json({ error: 'No data found' });
            }
            await gallery.update({
                is_active: status ? 1 : 0,
            });
            return res.json(gallery);
        }
        catch (error) {
            console.error('Update gallery error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            const gallery = await Gallery_1.default.findByPk(id);
            if (!gallery) {
                return res.status(404).json({ error: 'No data found' });
            }
            if (gallery.image) {
                const filePath = path_1.default.join(process.cwd(), 'public', gallery.image);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            await gallery.destroy();
            return res.json('Deleted');
        }
        catch (error) {
            console.error('Delete gallery error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
exports.AdminGalleryController = AdminGalleryController;
//# sourceMappingURL=AdminGalleryController.js.map