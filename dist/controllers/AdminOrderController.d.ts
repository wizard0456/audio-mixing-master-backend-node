import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class AdminOrderController {
    static index(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static show(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static orderUpdateFile(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateStatus(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static destroy(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=AdminOrderController.d.ts.map