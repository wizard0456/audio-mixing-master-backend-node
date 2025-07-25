export interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthRequest extends Request {
    user?: User;
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}
export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Order {
    id: string;
    userId: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Payment {
    id: string;
    orderId: string;
    amount: number;
    method: 'stripe' | 'paypal';
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
//# sourceMappingURL=index.d.ts.map