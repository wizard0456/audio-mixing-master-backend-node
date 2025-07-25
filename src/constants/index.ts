// Application Constants
export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // File Upload
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/aiff', 'audio/flac'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  
  // JWT
  JWT_EXPIRES_IN: '7d',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Order Status
  ORDER_STATUS: {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  
  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
  },
  
  // User Roles
  USER_ROLES: {
    ADMIN: 'ADMIN',
    USER: 'USER',
  },
  
  // User Status
  USER_STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  
  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PASSWORD: 'Password must be at least 8 characters long',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  
  // Database
  RECORD_NOT_FOUND: 'Record not found',
  DUPLICATE_ENTRY: 'Record already exists',
  
  // Server
  INTERNAL_SERVER_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  
  // CRUD Operations
  CREATED_SUCCESS: 'Record created successfully',
  UPDATED_SUCCESS: 'Record updated successfully',
  DELETED_SUCCESS: 'Record deleted successfully',
  
  // File Operations
  FILE_UPLOADED_SUCCESS: 'File uploaded successfully',
  FILE_DELETED_SUCCESS: 'File deleted successfully',
} as const; 