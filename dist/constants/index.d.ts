export declare const APP_CONSTANTS: {
    readonly DEFAULT_PAGE_SIZE: 10;
    readonly MAX_PAGE_SIZE: 100;
    readonly MAX_FILE_SIZE: number;
    readonly ALLOWED_AUDIO_TYPES: readonly ["audio/mpeg", "audio/wav", "audio/aiff", "audio/flac"];
    readonly ALLOWED_IMAGE_TYPES: readonly ["image/jpeg", "image/png", "image/webp"];
    readonly ALLOWED_DOCUMENT_TYPES: readonly ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    readonly JWT_EXPIRES_IN: "7d";
    readonly RATE_LIMIT_WINDOW_MS: number;
    readonly RATE_LIMIT_MAX_REQUESTS: 100;
    readonly ORDER_STATUS: {
        readonly PENDING: "PENDING";
        readonly CONFIRMED: "CONFIRMED";
        readonly IN_PROGRESS: "IN_PROGRESS";
        readonly COMPLETED: "COMPLETED";
        readonly CANCELLED: "CANCELLED";
    };
    readonly PAYMENT_STATUS: {
        readonly PENDING: "PENDING";
        readonly COMPLETED: "COMPLETED";
        readonly FAILED: "FAILED";
        readonly CANCELLED: "CANCELLED";
    };
    readonly USER_ROLES: {
        readonly ADMIN: "ADMIN";
        readonly USER: "USER";
    };
    readonly USER_STATUS: {
        readonly ACTIVE: "ACTIVE";
        readonly INACTIVE: "INACTIVE";
        readonly SUSPENDED: "SUSPENDED";
    };
};
export declare const ERROR_MESSAGES: {
    readonly UNAUTHORIZED: "Unauthorized access";
    readonly INVALID_CREDENTIALS: "Invalid email or password";
    readonly TOKEN_EXPIRED: "Token has expired";
    readonly TOKEN_INVALID: "Invalid token";
    readonly REQUIRED_FIELD: "This field is required";
    readonly INVALID_EMAIL: "Invalid email format";
    readonly INVALID_PASSWORD: "Password must be at least 8 characters long";
    readonly FILE_TOO_LARGE: "File size exceeds maximum limit";
    readonly INVALID_FILE_TYPE: "Invalid file type";
    readonly RECORD_NOT_FOUND: "Record not found";
    readonly DUPLICATE_ENTRY: "Record already exists";
    readonly INTERNAL_SERVER_ERROR: "Internal server error";
    readonly SERVICE_UNAVAILABLE: "Service temporarily unavailable";
};
export declare const SUCCESS_MESSAGES: {
    readonly LOGIN_SUCCESS: "Login successful";
    readonly REGISTER_SUCCESS: "Registration successful";
    readonly LOGOUT_SUCCESS: "Logout successful";
    readonly PASSWORD_RESET_SUCCESS: "Password reset successful";
    readonly CREATED_SUCCESS: "Record created successfully";
    readonly UPDATED_SUCCESS: "Record updated successfully";
    readonly DELETED_SUCCESS: "Record deleted successfully";
    readonly FILE_UPLOADED_SUCCESS: "File uploaded successfully";
    readonly FILE_DELETED_SUCCESS: "File deleted successfully";
};
//# sourceMappingURL=index.d.ts.map