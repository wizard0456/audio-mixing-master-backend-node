import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class OrderController {
    static index(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static show(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateStatus(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getStats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=OrderController.d.ts.map