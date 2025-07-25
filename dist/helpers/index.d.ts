import { Request } from 'express';
export declare const getPaginationParams: (req: Request) => {
    page: number;
    limit: number;
    skip: number;
};
export declare const createPaginatedResponse: (data: any[], total: number, page: number, limit: number) => {
    data: any[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
        has_next_page: boolean;
        has_prev_page: boolean;
    };
};
export declare const validateFileType: (mimetype: string, allowedTypes: string[]) => boolean;
export declare const validateFileSize: (size: number, maxSize: number) => boolean;
export declare const generateRandomString: (length?: number) => string;
export declare const generateOrderNumber: () => string;
export declare const formatCurrency: (amount: number, currency?: string) => string;
export declare const sanitizeFilename: (filename: string) => string;
export declare const getFileExtension: (filename: string) => string;
export declare const isValidEmail: (email: string) => boolean;
export declare const isValidPhone: (phone: string) => boolean;
export declare const calculateDiscount: (originalPrice: number, discountPercentage: number) => number;
export declare const calculateFinalPrice: (originalPrice: number, discountPercentage: number) => number;
//# sourceMappingURL=index.d.ts.map