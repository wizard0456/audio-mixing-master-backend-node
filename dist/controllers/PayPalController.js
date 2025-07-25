"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalController = void 0;
class PayPalController {
    static async revisionSuccess(req, res) {
        try {
            const { order_id, revision_id, amount } = req.body;
            if (!order_id || !revision_id || !amount) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            return res.json({
                message: 'Revision payment successful',
                order_id,
                revision_id,
                amount
            });
        }
        catch (error) {
            console.error('PayPal revisionSuccess error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.PayPalController = PayPalController;
//# sourceMappingURL=PayPalController.js.map