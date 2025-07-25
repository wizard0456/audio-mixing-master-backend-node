"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.APP_CONSTANTS = void 0;
exports.APP_CONSTANTS = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    MAX_FILE_SIZE: 100 * 1024 * 1024,
    ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/aiff', 'audio/flac'],
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    JWT_EXPIRES_IN: '7d',
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
    RATE_LIMIT_MAX_REQUESTS: 100,
    ORDER_STATUS: {
        PENDING: 'PENDING',
        CONFIRMED: 'CONFIRMED',
        IN_PROGRESS: 'IN_PROGRESS',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED',
    },
    PAYMENT_STATUS: {
        PENDING: 'PENDING',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED',
        CANCELLED: 'CANCELLED',
    },
    USER_ROLES: {
        ADMIN: 'ADMIN',
        USER: 'USER',
    },
    USER_STATUS: {
        ACTIVE: 'ACTIVE',
        INACTIVE: 'INACTIVE',
        SUSPENDED: 'SUSPENDED',
    },
};
exports.ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized access',
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PASSWORD: 'Password must be at least 8 characters long',
    FILE_TOO_LARGE: 'File size exceeds maximum limit',
    INVALID_FILE_TYPE: 'Invalid file type',
    RECORD_NOT_FOUND: 'Record not found',
    DUPLICATE_ENTRY: 'Record already exists',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
};
exports.SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful',
    REGISTER_SUCCESS: 'Registration successful',
    LOGOUT_SUCCESS: 'Logout successful',
    PASSWORD_RESET_SUCCESS: 'Password reset successful',
    CREATED_SUCCESS: 'Record created successfully',
    UPDATED_SUCCESS: 'Record updated successfully',
    DELETED_SUCCESS: 'Record deleted successfully',
    FILE_UPLOADED_SUCCESS: 'File uploaded successfully',
    FILE_DELETED_SUCCESS: 'File deleted successfully',
};
//# sourceMappingURL=index.js.map