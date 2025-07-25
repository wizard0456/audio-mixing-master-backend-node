import { Request } from 'express';
import { APP_CONSTANTS } from '../constants';

// Pagination helper
export const getPaginationParams = (req: Request) => {
  const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
  const limit = Math.min(
    APP_CONSTANTS.MAX_PAGE_SIZE,
    Math.max(1, parseInt(req.query['per_page'] as string) || APP_CONSTANTS.DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

// Response helper
export const createPaginatedResponse = (data: any[], total: number, page: number, limit: number) => {
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

// File validation helper
export const validateFileType = (mimetype: string, allowedTypes: string[]) => {
  return allowedTypes.includes(mimetype);
};

export const validateFileSize = (size: number, maxSize: number) => {
  return size <= maxSize;
};

// Generate random string
export const generateRandomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate order number
export const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = generateRandomString(6);
  return `ORD-${timestamp}-${random}`;
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Sanitize filename
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

// Get file extension
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Calculate discount
export const calculateDiscount = (originalPrice: number, discountPercentage: number): number => {
  return originalPrice * (discountPercentage / 100);
};

// Calculate final price after discount
export const calculateFinalPrice = (originalPrice: number, discountPercentage: number): number => {
  const discount = calculateDiscount(originalPrice, discountPercentage);
  return originalPrice - discount;
}; 