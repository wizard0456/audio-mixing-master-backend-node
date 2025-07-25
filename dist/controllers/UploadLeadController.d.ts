import { Request, Response } from 'express';
export declare class UploadLeadController {
    static index(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static show(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static store(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static destroy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static display(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static downloadZip(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static downloadAudio(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=UploadLeadController.d.ts.map