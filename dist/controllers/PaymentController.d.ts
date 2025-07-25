import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class PaymentController {
    static paypal(req: AuthRequest | any, res: Response): Promise<Response<any, Record<string, any>>>;
    static createPaymentIntent(req: AuthRequest | any, res: Response): Promise<Response<any, Record<string, any>>>;
    static stripePay(req: AuthRequest | any, res: Response): Promise<Response<any, Record<string, any>>>;
    static stripeSubscribe(req: AuthRequest | any, res: Response): Promise<Response<any, Record<string, any>>>;
    static createSubscription(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getOrderDetails(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static orderDetails(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static userOrders(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static success(req: AuthRequest | any, res: Response): Promise<Response<any, Record<string, any>>>;
    static cancel(_req: AuthRequest | any, res: Response): Promise<Response<any, Record<string, any>>>;
    static processPayment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static refundPayment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getPaymentHistory(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getPayment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static stripeWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static handleCheckoutSessionCompleted(session: any): Promise<void>;
    static handlePaymentIntentSucceeded(paymentIntent: any): Promise<void>;
    static handleInvoicePaymentSucceeded(invoice: any): Promise<void>;
}
//# sourceMappingURL=PaymentController.d.ts.map