import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
declare const upload: multer.Multer;
export declare class RevisionController {
    static store(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static upload(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static flagAdmin(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static flagUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getData(_req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export { upload };
//# sourceMappingURL=RevisionController.d.ts.map