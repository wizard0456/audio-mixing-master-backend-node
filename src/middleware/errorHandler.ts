import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  // Handle multer errors
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field.' });
    }
    return res.status(400).json({ message: err.message });
  }

  // Handle other errors
  if (err.message) {
    return res.status(500).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
}; 