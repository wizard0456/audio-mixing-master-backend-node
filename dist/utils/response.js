"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseUtil = void 0;
class ResponseUtil {
    static success(data, message = 'Success') {
        return {
            success: true,
            message,
            data,
        };
    }
    static error(message, error) {
        return {
            success: false,
            message,
            ...(error && { error }),
        };
    }
    static paginated(data, page, limit, total, message = 'Success') {
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
exports.ResponseUtil = ResponseUtil;
//# sourceMappingURL=response.js.map