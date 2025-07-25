import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class CartController {
    static index(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static add(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static remove(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=CartController.d.ts.map