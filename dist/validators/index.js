"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactLeadValidation = exports.searchValidation = exports.paginationValidation = exports.fileValidation = exports.paymentValidation = exports.cartValidation = exports.orderValidation = exports.categoryValidation = exports.serviceValidation = exports.userValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../constants");
exports.userValidation = {
    register: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
        phone: joi_1.default.string().optional(),
        address: joi_1.default.string().optional(),
        city: joi_1.default.string().optional(),
        state: joi_1.default.string().optional(),
        country: joi_1.default.string().optional(),
        zipCode: joi_1.default.string().optional(),
    }),
    login: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required(),
    }),
    update: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).optional(),
        phone: joi_1.default.string().optional(),
        address: joi_1.default.string().optional(),
        city: joi_1.default.string().optional(),
        state: joi_1.default.string().optional(),
        country: joi_1.default.string().optional(),
        zipCode: joi_1.default.string().optional(),
    }),
    forgotPassword: joi_1.default.object({
        email: joi_1.default.string().email().required(),
    }),
    resetPassword: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        token: joi_1.default.string().required(),
        password: joi_1.default.string().min(8).required(),
    }),
};
exports.serviceValidation = {
    create: joi_1.default.object({
        name: joi_1.default.string().min(2).max(200).required(),
        description: joi_1.default.string().optional(),
        price: joi_1.default.number().positive().required(),
        image: joi_1.default.string().optional(),
        categoryId: joi_1.default.string().required(),
        status: joi_1.default.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
    }),
    update: joi_1.default.object({
        name: joi_1.default.string().min(2).max(200).optional(),
        description: joi_1.default.string().optional(),
        price: joi_1.default.number().positive().optional(),
        image: joi_1.default.string().optional(),
        categoryId: joi_1.default.string().optional(),
        status: joi_1.default.string().valid('ACTIVE', 'INACTIVE').optional(),
    }),
};
exports.categoryValidation = {
    create: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).required(),
        description: joi_1.default.string().optional(),
        image: joi_1.default.string().optional(),
        status: joi_1.default.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
    }),
    update: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).optional(),
        description: joi_1.default.string().optional(),
        image: joi_1.default.string().optional(),
        status: joi_1.default.string().valid('ACTIVE', 'INACTIVE').optional(),
    }),
};
exports.orderValidation = {
    create: joi_1.default.object({
        services: joi_1.default.array().items(joi_1.default.object({
            id: joi_1.default.string().required(),
            quantity: joi_1.default.number().integer().min(1).default(1),
            price: joi_1.default.number().positive().required(),
        })).min(1).required(),
        specialInstructions: joi_1.default.string().optional(),
        totalAmount: joi_1.default.number().positive().required(),
        paymentMethod: joi_1.default.string().optional(),
        transactionId: joi_1.default.string().optional(),
    }),
    updateStatus: joi_1.default.object({
        status: joi_1.default.string().valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').required(),
    }),
};
exports.cartValidation = {
    addItem: joi_1.default.object({
        services: joi_1.default.array().items(joi_1.default.object({
            id: joi_1.default.string().required(),
            quantity: joi_1.default.number().integer().min(1).default(1),
            price: joi_1.default.number().positive().required(),
            totalPrice: joi_1.default.number().positive().required(),
        })).min(1).required(),
    }),
    updateItem: joi_1.default.object({
        quantity: joi_1.default.number().integer().min(1).required(),
        price: joi_1.default.number().positive().required(),
        totalPrice: joi_1.default.number().positive().required(),
    }),
};
exports.paymentValidation = {
    createPayPal: joi_1.default.object({
        amount: joi_1.default.number().positive().required(),
        currency: joi_1.default.string().length(3).default('USD'),
        description: joi_1.default.string().optional(),
        cartItems: joi_1.default.array().optional(),
    }),
    createStripe: joi_1.default.object({
        amount: joi_1.default.number().positive().required(),
        currency: joi_1.default.string().length(3).default('USD'),
        cartItems: joi_1.default.array().required(),
    }),
};
exports.fileValidation = {
    upload: joi_1.default.object({
        file: joi_1.default.object({
            mimetype: joi_1.default.string().valid(...constants_1.APP_CONSTANTS.ALLOWED_AUDIO_TYPES, ...constants_1.APP_CONSTANTS.ALLOWED_IMAGE_TYPES, ...constants_1.APP_CONSTANTS.ALLOWED_DOCUMENT_TYPES).required(),
            size: joi_1.default.number().max(constants_1.APP_CONSTANTS.MAX_FILE_SIZE).required(),
        }).required(),
    }),
};
exports.paginationValidation = {
    query: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        per_page: joi_1.default.number().integer().min(1).max(constants_1.APP_CONSTANTS.MAX_PAGE_SIZE).default(constants_1.APP_CONSTANTS.DEFAULT_PAGE_SIZE),
    }),
};
exports.searchValidation = {
    query: joi_1.default.object({
        q: joi_1.default.string().min(1).required(),
        page: joi_1.default.number().integer().min(1).default(1),
        per_page: joi_1.default.number().integer().min(1).max(constants_1.APP_CONSTANTS.MAX_PAGE_SIZE).default(constants_1.APP_CONSTANTS.DEFAULT_PAGE_SIZE),
    }),
};
exports.contactLeadValidation = {
    create: joi_1.default.object({
        name: joi_1.default.string().max(255).required().messages({
            'string.empty': 'Name required.',
            'string.max': 'Name maximum 255 characters.',
            'any.required': 'Name required.'
        }),
        email: joi_1.default.string().email().max(255).lowercase().required().messages({
            'string.empty': 'Email required',
            'string.email': 'Invalid Email',
            'string.max': 'Email must be less than 255 characters.',
            'string.lowercase': 'Email must be lowercase.',
            'any.required': 'Email required'
        }),
        subject: joi_1.default.string().max(255).required().messages({
            'string.empty': 'Subject required.',
            'string.max': 'Subject maximum 255 characters.',
            'any.required': 'Subject required.'
        }),
        message: joi_1.default.string().max(255).required().messages({
            'string.empty': 'Message required.',
            'string.max': 'Message maximum 255 characters.',
            'any.required': 'Message required.'
        }),
    }),
};
//# sourceMappingURL=index.js.map