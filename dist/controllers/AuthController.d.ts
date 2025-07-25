import { Request, Response } from 'express';
export declare class AuthController {
    static register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static verifyEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static resendVerificationEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static forgotPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static resetPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getCurrentUser(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    static getFavourites(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    static addFavourite(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    static removeFavourite(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    static checkFavourite(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    static getFavouriteCount(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    static adminLogin(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=AuthController.d.ts.map