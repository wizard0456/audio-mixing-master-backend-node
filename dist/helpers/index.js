"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFinalPrice = exports.calculateDiscount = exports.isValidPhone = exports.isValidEmail = exports.getFileExtension = exports.sanitizeFilename = exports.formatCurrency = exports.generateOrderNumber = exports.generateRandomString = exports.validateFileSize = exports.validateFileType = exports.createPaginatedResponse = exports.getPaginationParams = void 0;
const constants_1 = require("../constants");
const getPaginationParams = (req) => {
    const page = Math.max(1, parseInt(req.query['page']) || 1);
    const limit = Math.min(constants_1.APP_CONSTANTS.MAX_PAGE_SIZE, Math.max(1, parseInt(req.query['per_page']) || constants_1.APP_CONSTANTS.DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.getPaginationParams = getPaginationParams;
const createPaginatedResponse = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            current_page: page,
            per_page: limit,
            total,
            total_pages: totalPages,
            has_next_page: page < totalPages,
            has_prev_page: page > 1,
        },
    };
};
exports.createPaginatedResponse = createPaginatedResponse;
const validateFileType = (mimetype, allowedTypes) => {
    return allowedTypes.includes(mimetype);
};
exports.validateFileType = validateFileType;
const validateFileSize = (size, maxSize) => {
    return size <= maxSize;
};
exports.validateFileSize = validateFileSize;
const generateRandomString = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateRandomString = generateRandomString;
const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = (0, exports.generateRandomString)(6);
    return `ORD-${timestamp}-${random}`;
};
exports.generateOrderNumber = generateOrderNumber;
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const sanitizeFilename = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
};
exports.sanitizeFilename = sanitizeFilename;
const getFileExtension = (filename) => {
    return filename.split('.').pop()?.toLowerCase() || '';
};
exports.getFileExtension = getFileExtension;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
};
exports.isValidPhone = isValidPhone;
const calculateDiscount = (originalPrice, discountPercentage) => {
    return originalPrice * (discountPercentage / 100);
};
exports.calculateDiscount = calculateDiscount;
const calculateFinalPrice = (originalPrice, discountPercentage) => {
    const discount = (0, exports.calculateDiscount)(originalPrice, discountPercentage);
    return originalPrice - discount;
};
exports.calculateFinalPrice = calculateFinalPrice;
//# sourceMappingURL=index.js.map