import { Request, Response } from 'express';
export declare class ServiceController {
    static index(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getServiceDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static show(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getVariations(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static search(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getByCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=ServiceController.d.ts.map