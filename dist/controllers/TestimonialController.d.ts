import { Request, Response } from 'express';
export declare class TestimonialController {
    static index(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static show(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static create(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static destroy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getApproved(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static TestimonialList(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=TestimonialController.d.ts.map