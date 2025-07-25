import { Request, Response } from 'express';
export declare class BlogController {
    static index(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static show(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static create(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static destroy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static uploadHtml(req: Request, res: Response): void;
    static getCategories(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getStats(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=BlogController.d.ts.map