import { ApiResponse } from '../types';

export class ResponseUtil {
  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, error?: string): ApiResponse {
    return {
      success: false,
      message,
      ...(error && { error }),
    };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Success'
  ): ApiResponse<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return {
      success: true,
      message,
      data: {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }
} 