"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqController = void 0;
const models_1 = require("../models");
class FaqController {
    static async FaqList(_req, res) {
        try {
            const faqs = await models_1.FAQ.findAll({
                order: [['created_at', 'ASC']],
            });
            if (faqs.length === 0) {
                return res.status(200).json({ error: 'No data found' });
            }
            return res.json(faqs);
        }
        catch (error) {
            console.error('FAQ list error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
exports.FaqController = FaqController;
//# sourceMappingURL=FaqController.js.map