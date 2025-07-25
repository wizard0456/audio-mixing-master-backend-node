"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadGenerationController = void 0;
const models_1 = require("../models");
class LeadGenerationController {
    static async index(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 10;
            const page = parseInt(req.query['page']) || 1;
            const offset = (page - 1) * perPage;
            const { count, rows: leads } = await models_1.UploadLeadGeneration.findAndCountAll({
                order: [['id', 'DESC']],
                offset,
                limit: perPage,
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
            return res.json({
                current_page: page,
                data: leads,
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
            console.error('LeadGeneration index error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const lead = await models_1.UploadLeadGeneration.findByPk(id);
            if (!lead) {
                return res.status(404).json({ message: 'Lead not found' });
            }
            return res.json(lead);
        }
        catch (error) {
            console.error('LeadGeneration show error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async store(req, res) {
        try {
            const lead = await models_1.UploadLeadGeneration.create(req.body);
            return res.status(201).json(lead);
        }
        catch (error) {
            console.error('LeadGeneration store error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            const lead = await models_1.UploadLeadGeneration.findByPk(id);
            if (!lead) {
                return res.status(404).json({ message: 'Lead not found' });
            }
            await lead.destroy();
            return res.json({ message: 'Lead deleted successfully' });
        }
        catch (error) {
            console.error('LeadGeneration destroy error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async exportLead(_req, res) {
        try {
            const leads = await models_1.UploadLeadGeneration.findAll({
                order: [['id', 'DESC']],
            });
            const csvData = leads.map(lead => {
                const data = lead.toJSON();
                return Object.values(data).join(',');
            }).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
            return res.send(csvData);
        }
        catch (error) {
            console.error('LeadGeneration export error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.LeadGenerationController = LeadGenerationController;
//# sourceMappingURL=LeadGenerationController.js.map