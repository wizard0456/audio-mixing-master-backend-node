import { ApiResponse } from '../types';
export declare class ResponseUtil {
    static success<T>(data: T, message?: string): ApiResponse<T>;
    static error(message: string, error?: string): ApiResponse;
    static paginated<T>(data: T[], page: number, limit: number, total: number, message?: string): ApiResponse<{
        data: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
//# sourceMappingURL=response.d.ts.map