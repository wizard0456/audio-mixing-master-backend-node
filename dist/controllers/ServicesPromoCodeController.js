"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesPromoCodeController = void 0;
class ServicesPromoCodeController {
    static async index(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 10;
            const page = parseInt(req.query['page']) || 1;
            const promoCodes = [];
            const count = 0;
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
                data: promoCodes,
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
            console.error('ServicesPromoCode index error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async show(_req, res) {
        try {
            return res.status(404).json({ message: 'Promo code not found' });
        }
        catch (error) {
            console.error('ServicesPromoCode show error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async update(_req, res) {
        try {
            return res.status(404).json({ message: 'Promo code not found' });
        }
        catch (error) {
            console.error('ServicesPromoCode update error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async destroy(_req, res) {
        try {
            return res.status(404).json({ message: 'Promo code not found' });
        }
        catch (error) {
            console.error('ServicesPromoCode destroy error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async insertServicePromoCodes(_req, res) {
        try {
            return res.json({ message: 'Promo codes inserted successfully' });
        }
        catch (error) {
            console.error('ServicesPromoCode insertServicePromoCodes error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async verifyPromoCodes(_req, res) {
        try {
            return res.status(404).json({ message: 'Promo code not found' });
        }
        catch (error) {
            console.error('ServicesPromoCode verifyPromoCodes error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.ServicesPromoCodeController = ServicesPromoCodeController;
//# sourceMappingURL=ServicesPromoCodeController.js.map