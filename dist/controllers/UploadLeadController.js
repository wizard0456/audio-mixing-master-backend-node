"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadLeadController = void 0;
const models_1 = require("../models");
const express_validator_1 = require("express-validator");
class UploadLeadController {
    static async index(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 10;
            const page = parseInt(req.query['page']) || 1;
            const offset = (page - 1) * perPage;
            const { count, rows: uploadLeads } = await models_1.UploadLeadGeneration.findAndCountAll({
                order: [['id', 'DESC']],
                offset,
                limit: perPage,
            });
            if (count === 0) {
                return res.status(404).json({ error: 'No data found' });
            }
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
            return res.json({
                current_page: page,
                data: uploadLeads,
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
            console.error('Upload lead index error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const uploadLead = await models_1.UploadLeadGeneration.findByPk(id);
            if (!uploadLead) {
                return res.status(404).json({ error: 'No data found' });
            }
            return res.json(uploadLead);
        }
        catch (error) {
            console.error('Upload lead show error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async store(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array()[0]?.msg || 'Validation error' });
            }
            const { name, email, arlist_name, tarck_title, image_url, services, reference } = req.body;
            if (!image_url) {
                return res.status(400).json({ error: 'An image URL is required.' });
            }
            try {
                new URL(image_url);
            }
            catch {
                return res.status(400).json({ error: 'Invalid URL format.' });
            }
            const uploadLead = await models_1.UploadLeadGeneration.create({
                name,
                email,
                arlist_name,
                tarck_title,
                image: image_url,
                services,
                reference,
                file_type: 0,
            });
            return res.json({ message: 'success', upload_leads: uploadLead });
        }
        catch (error) {
            console.error('Upload lead store error:', error);
            return res.status(400).json({ error: 'Server error' });
        }
    }
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            const uploadLead = await models_1.UploadLeadGeneration.findByPk(id);
            if (!uploadLead) {
                return res.status(404).json({ error: 'No data found' });
            }
            await uploadLead.destroy();
            return res.json('Deleted');
        }
        catch (error) {
            console.error('Upload lead destroy error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async display(_req, res) {
        return res.json('helo');
    }
    static async downloadZip(req, res) {
        try {
            const { id } = req.params;
            const uploadLead = await models_1.UploadLeadGeneration.findByPk(id);
            if (!uploadLead) {
                return res.status(404).json({ error: 'No data found' });
            }
            const imageUrl = uploadLead.image;
            if (!imageUrl) {
                return res.status(404).json({ error: 'No File found' });
            }
            return res.json({ url: imageUrl });
        }
        catch (error) {
            console.error('Get file URL error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async downloadAudio(req, res) {
        try {
            const { id } = req.params;
            const uploadLead = await models_1.UploadLeadGeneration.findByPk(id);
            if (!uploadLead) {
                return res.status(404).json({ error: 'No order found' });
            }
            const imageUrl = uploadLead.image;
            if (!imageUrl) {
                return res.status(404).json({ error: 'No file found' });
            }
            return res.json({ url: imageUrl });
        }
        catch (error) {
            console.error('Get file URL error:', error);
            return res.status(400).json({ error: 'Server error' });
        }
    }
}
exports.UploadLeadController = UploadLeadController;
//# sourceMappingURL=UploadLeadController.js.map