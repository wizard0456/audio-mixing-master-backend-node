"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleAudioController = void 0;
const models_1 = require("../models");
class SampleAudioController {
    static async index(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 12;
            const page = parseInt(req.query['page']) || 1;
            const offset = (page - 1) * perPage;
            const { count, rows: samples } = await models_1.Sample.findAndCountAll({
                where: { is_active: 1 },
                offset,
                limit: perPage,
                order: [['createdAt', 'DESC']],
            });
            if (count === 0) {
                return res.status(404).json({ error: 'No data found.' });
            }
            const lastPage = Math.ceil(count / perPage);
            const formattedSamples = samples.map((sample) => {
                const sampleData = sample.toJSON();
                return {
                    id: sampleData.id,
                    name: sampleData.name,
                    before_audio: sampleData.before_audio,
                    after_audio: sampleData.after_audio,
                    is_active: sampleData.is_active,
                    created_at: sampleData.createdAt,
                    updated_at: sampleData.updatedAt,
                };
            });
            const protocol = req.protocol;
            const host = req.get('host');
            const basePath = req.baseUrl + req.path;
            const baseUrl = `${protocol}://${host}${basePath}`;
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
                    url: `${baseUrl}?page=${i}`,
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
                data: formattedSamples,
                first_page_url: firstPageUrl,
                from: count === 0 ? null : ((page - 1) * perPage) + 1,
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
            console.error('Sample audio index error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const sample = await models_1.Sample.findOne({
                where: { id, is_active: 1 },
            });
            if (!sample) {
                return res.status(404).json({ error: 'No data found.' });
            }
            const sampleData = sample.toJSON();
            const formattedSample = {
                id: sampleData.id,
                name: sampleData.name,
                before_audio: sampleData.before_audio,
                after_audio: sampleData.after_audio,
                is_active: sampleData.is_active,
                created_at: sampleData.createdAt,
                updated_at: sampleData.updatedAt,
            };
            return res.json(formattedSample);
        }
        catch (error) {
            console.error('Sample audio show error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
exports.SampleAudioController = SampleAudioController;
//# sourceMappingURL=SampleAudioController.js.map