"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactLeadController = void 0;
const models_1 = require("../models");
const express_validator_1 = require("express-validator");
class ContactLeadController {
    static async index(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 10;
            const page = parseInt(req.query['page']) || 1;
            const offset = (page - 1) * perPage;
            const { count, rows: contactLeads } = await models_1.ContactLeadGeneration.findAndCountAll({
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
                data: contactLeads,
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
            console.error('Contact lead index error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const contactLead = await models_1.ContactLeadGeneration.findByPk(id);
            if (!contactLead) {
                return res.status(404).json({ error: 'No data found' });
            }
            return res.json(contactLead);
        }
        catch (error) {
            console.error('Contact lead show error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async store(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array()[0]?.msg || 'Validation error' });
            }
            const { name, email, subject, message } = req.body;
            const contactLead = await models_1.ContactLeadGeneration.create({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                subject: subject.trim(),
                message: message.trim(),
            });
            return res.json({ message: 'success', contact_leads: contactLead });
        }
        catch (error) {
            console.error('Contact lead store error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            const contactLead = await models_1.ContactLeadGeneration.findByPk(id);
            if (!contactLead) {
                return res.status(404).json({ error: 'No data found' });
            }
            await contactLead.destroy();
            return res.json('Deleted');
        }
        catch (error) {
            console.error('Contact lead destroy error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
exports.ContactLeadController = ContactLeadController;
//# sourceMappingURL=ContactLeadController.js.map