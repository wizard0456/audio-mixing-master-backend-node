import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class AdminUserController {
    static index(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static store(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static show(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static destroy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static storeEngineer(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static listEngineer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static showEngineer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=AdminUserController.d.ts.map