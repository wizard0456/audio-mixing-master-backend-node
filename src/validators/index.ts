import Joi from 'joi';
import { APP_CONSTANTS } from '../constants';

// User validation schemas
export const userValidation = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    zipCode: Joi.string().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    zipCode: Joi.string().optional(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
    password: Joi.string().min(8).required(),
  }),
};

// Service validation schemas
export const serviceValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().optional(),
    price: Joi.number().positive().required(),
    image: Joi.string().optional(),
    categoryId: Joi.string().required(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    description: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    image: Joi.string().optional(),
    categoryId: Joi.string().optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
  }),
};

// Category validation schemas
export const categoryValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().optional(),
    image: Joi.string().optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().optional(),
    image: Joi.string().optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
  }),
};

// Order validation schemas
export const orderValidation = {
  create: Joi.object({
    services: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        quantity: Joi.number().integer().min(1).default(1),
        price: Joi.number().positive().required(),
      })
    ).min(1).required(),
    specialInstructions: Joi.string().optional(),
    totalAmount: Joi.number().positive().required(),
    paymentMethod: Joi.string().optional(),
    transactionId: Joi.string().optional(),
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid(
      'PENDING',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED'
    ).required(),
  }),
};

// Cart validation schemas
export const cartValidation = {
  addItem: Joi.object({
    services: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        quantity: Joi.number().integer().min(1).default(1),
        price: Joi.number().positive().required(),
        totalPrice: Joi.number().positive().required(),
      })
    ).min(1).required(),
  }),

  updateItem: Joi.object({
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().positive().required(),
    totalPrice: Joi.number().positive().required(),
  }),
};

// Payment validation schemas
export const paymentValidation = {
  createPayPal: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).default('USD'),
    description: Joi.string().optional(),
    cartItems: Joi.array().optional(),
  }),

  createStripe: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).default('USD'),
    cartItems: Joi.array().required(),
  }),
};

// File upload validation schemas
export const fileValidation = {
  upload: Joi.object({
    file: Joi.object({
      mimetype: Joi.string().valid(...APP_CONSTANTS.ALLOWED_AUDIO_TYPES, ...APP_CONSTANTS.ALLOWED_IMAGE_TYPES, ...APP_CONSTANTS.ALLOWED_DOCUMENT_TYPES).required(),
      size: Joi.number().max(APP_CONSTANTS.MAX_FILE_SIZE).required(),
    }).required(),
  }),
};

// Pagination validation schemas
export const paginationValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    per_page: Joi.number().integer().min(1).max(APP_CONSTANTS.MAX_PAGE_SIZE).default(APP_CONSTANTS.DEFAULT_PAGE_SIZE),
  }),
};

// Search validation schemas
export const searchValidation = {
  query: Joi.object({
    q: Joi.string().min(1).required(),
    page: Joi.number().integer().min(1).default(1),
    per_page: Joi.number().integer().min(1).max(APP_CONSTANTS.MAX_PAGE_SIZE).default(APP_CONSTANTS.DEFAULT_PAGE_SIZE),
  }),
};

// Contact Lead Generation validation schemas
export const contactLeadValidation = {
  create: Joi.object({
    name: Joi.string().max(255).required().messages({
      'string.empty': 'Name required.',
      'string.max': 'Name maximum 255 characters.',
      'any.required': 'Name required.'
    }),
    email: Joi.string().email().max(255).lowercase().required().messages({
      'string.empty': 'Email required',
      'string.email': 'Invalid Email',
      'string.max': 'Email must be less than 255 characters.',
      'string.lowercase': 'Email must be lowercase.',
      'any.required': 'Email required'
    }),
    subject: Joi.string().max(255).required().messages({
      'string.empty': 'Subject required.',
      'string.max': 'Subject maximum 255 characters.',
      'any.required': 'Subject required.'
    }),
    message: Joi.string().max(255).required().messages({
      'string.empty': 'Message required.',
      'string.max': 'Message maximum 255 characters.',
      'any.required': 'Message required.'
    }),
  }),
}; 