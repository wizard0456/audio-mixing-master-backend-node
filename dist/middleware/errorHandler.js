"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const multer_1 = require("multer");
const errorHandler = (err, _req, res, _next) => {
    console.error('Error:', err);
    if (err instanceof multer_1.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: 'Unexpected file field.' });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err.message) {
        return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map