import { Request, Response } from 'express';
export declare class AdminBlogController {
    static index(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static show(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static create(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static destroy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getCategories(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static destroyCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=AdminBlogController.d.ts.map