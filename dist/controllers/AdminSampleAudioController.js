"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSampleAudioController = void 0;
const models_1 = require("../models");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class AdminSampleAudioController {
    static async index(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 10;
            const page = parseInt(req.query['page']) || 1;
            const isActive = req.query['is_active'];
            const offset = (page - 1) * perPage;
            let whereClause = {};
            if (isActive === 'active') {
                whereClause.is_active = 1;
            }
            else if (isActive === 'inactive') {
                whereClause.is_active = 0;
            }
            const { count, rows } = await models_1.Sample.findAndCountAll({
                where: whereClause,
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
            console.error('Error in AdminSampleAudioController.index:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const sample = await models_1.Sample.findByPk(id);
            if (!sample) {
                return res.status(404).json({ error: 'No data found' });
            }
            return res.json(sample);
        }
        catch (error) {
            console.error('Error in AdminSampleAudioController.show:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async store(req, res) {
        try {
            const { name } = req.body;
            if (!name || name.trim().length === 0) {
                return res.status(400).json({ error: 'Name required.' });
            }
            if (name.length > 255) {
                return res.status(400).json({ error: 'Name maximum 255 characters.' });
            }
            if (!req.files || !req.files['before_audio']) {
                return res.status(400).json({ error: 'Before audio required.' });
            }
            if (!req.files || !req.files['after_audio']) {
                return res.status(400).json({ error: 'After audio required.' });
            }
            const beforeAudioFile = req.files['before_audio'];
            const afterAudioFile = req.files['after_audio'];
            const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/aac'];
            if (!allowedMimeTypes.includes(beforeAudioFile[0].mimetype)) {
                return res.status(400).json({ error: 'Before audio must be a audio file.' });
            }
            if (!allowedMimeTypes.includes(afterAudioFile[0].mimetype)) {
                return res.status(400).json({ error: 'After audio must be a audio file.' });
            }
            const uploadDir = path_1.default.join(process.cwd(), 'public', 'sample-audios');
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            const beforeAudioExtension = beforeAudioFile[0].originalname?.split('.').pop() || 'mp3';
            const beforeAudioName = `before_audio_${Date.now()}.${beforeAudioExtension}`;
            const beforeAudioPath = path_1.default.join(uploadDir, beforeAudioName);
            fs_1.default.writeFileSync(beforeAudioPath, beforeAudioFile[0].buffer);
            const afterAudioExtension = afterAudioFile[0].originalname?.split('.').pop() || 'mp3';
            const afterAudioName = `after_audio_${Date.now()}.${afterAudioExtension}`;
            const afterAudioPath = path_1.default.join(uploadDir, afterAudioName);
            fs_1.default.writeFileSync(afterAudioPath, afterAudioFile[0].buffer);
            const sample = await models_1.Sample.create({
                name: name.trim(),
                before_audio: `sample-audios/${beforeAudioName}`,
                after_audio: `sample-audios/${afterAudioName}`,
            });
            return res.json(sample);
        }
        catch (error) {
            console.error('Error in AdminSampleAudioController.store:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, is_active } = req.body;
            if (!name || name.trim().length === 0) {
                return res.status(400).json({ error: 'Name required.' });
            }
            if (name.length > 255) {
                return res.status(400).json({ error: 'Name maximum 255 characters.' });
            }
            const sample = await models_1.Sample.findByPk(id);
            if (!sample) {
                return res.status(404).json({ error: 'No data found' });
            }
            if (req.files && req.files['before_audio']) {
                const beforeAudioFile = req.files['before_audio'];
                const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/aac'];
                if (!allowedMimeTypes.includes(beforeAudioFile[0].mimetype)) {
                    return res.status(400).json({ error: 'Before audio must be a audio file.' });
                }
                if (sample.before_audio) {
                    const oldFilePath = path_1.default.join(process.cwd(), 'public', sample.before_audio);
                    if (fs_1.default.existsSync(oldFilePath)) {
                        fs_1.default.unlinkSync(oldFilePath);
                    }
                }
                const uploadDir = path_1.default.join(process.cwd(), 'public', 'sample-audios');
                if (!fs_1.default.existsSync(uploadDir)) {
                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                }
                const beforeAudioExtension = beforeAudioFile[0].originalname?.split('.').pop() || 'mp3';
                const beforeAudioName = `before_audio_${Date.now()}.${beforeAudioExtension}`;
                const beforeAudioPath = path_1.default.join(uploadDir, beforeAudioName);
                fs_1.default.writeFileSync(beforeAudioPath, beforeAudioFile[0].buffer);
                sample.before_audio = `sample-audios/${beforeAudioName}`;
            }
            if (req.files && req.files['after_audio']) {
                const afterAudioFile = req.files['after_audio'];
                const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/aac'];
                if (!allowedMimeTypes.includes(afterAudioFile[0].mimetype)) {
                    return res.status(400).json({ error: 'After audio must be a audio file.' });
                }
                if (sample.after_audio) {
                    const oldFilePath = path_1.default.join(process.cwd(), 'public', sample.after_audio);
                    if (fs_1.default.existsSync(oldFilePath)) {
                        fs_1.default.unlinkSync(oldFilePath);
                    }
                }
                const uploadDir = path_1.default.join(process.cwd(), 'public', 'sample-audios');
                if (!fs_1.default.existsSync(uploadDir)) {
                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                }
                const afterAudioExtension = afterAudioFile[0].originalname?.split('.').pop() || 'mp3';
                const afterAudioName = `after_audio_${Date.now()}.${afterAudioExtension}`;
                const afterAudioPath = path_1.default.join(uploadDir, afterAudioName);
                fs_1.default.writeFileSync(afterAudioPath, afterAudioFile[0].buffer);
                sample.after_audio = `sample-audios/${afterAudioName}`;
            }
            sample.name = name.trim();
            if (is_active !== undefined) {
                sample.is_active = is_active;
            }
            await sample.save();
            return res.json(sample);
        }
        catch (error) {
            console.error('Error in AdminSampleAudioController.update:', error);
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
            const sample = await models_1.Sample.findByPk(id);
            if (!sample) {
                return res.status(404).json({ error: 'No data found' });
            }
            sample.is_active = status ? 1 : 0;
            await sample.save();
            return res.json(sample);
        }
        catch (error) {
            console.error('Error in AdminSampleAudioController.updateStatus:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            const sample = await models_1.Sample.findByPk(id);
            if (!sample) {
                return res.status(404).json({ error: 'No data found' });
            }
            if (sample.before_audio) {
                const beforeAudioPath = path_1.default.join(process.cwd(), 'public', sample.before_audio);
                if (fs_1.default.existsSync(beforeAudioPath)) {
                    fs_1.default.unlinkSync(beforeAudioPath);
                }
            }
            if (sample.after_audio) {
                const afterAudioPath = path_1.default.join(process.cwd(), 'public', sample.after_audio);
                if (fs_1.default.existsSync(afterAudioPath)) {
                    fs_1.default.unlinkSync(afterAudioPath);
                }
            }
            await sample.destroy();
            return res.json('Deleted');
        }
        catch (error) {
            console.error('Error in AdminSampleAudioController.destroy:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.AdminSampleAudioController = AdminSampleAudioController;
//# sourceMappingURL=AdminSampleAudioController.js.map