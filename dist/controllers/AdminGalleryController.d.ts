import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class AdminGalleryController {
    static index(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static store(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static show(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static destroy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=AdminGalleryController.d.ts.map