"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.engineerAuth = exports.adminAuth = exports.optionalAuth = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        let jwtToken;
        if (token.includes('|')) {
            const parts = token.split('|');
            if (parts.length < 2 || !parts[1]) {
                return res.status(401).json({ message: 'Token is not valid' });
            }
            jwtToken = parts[1];
        }
        else {
            jwtToken = token;
        }
        if (!jwtToken) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        const decoded = jsonwebtoken_1.default.verify(jwtToken, 'fallback-secret');
        const user = await User_1.default.findByPk(decoded.id, {
            attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'is_active'],
        });
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        if (user.is_active !== 1) {
            return res.status(401).json({ message: 'Account is not active' });
        }
        req.user = user;
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
};
exports.auth = auth;
const optionalAuth = async (req, _res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            req.user = null;
            return next();
        }
        let jwtToken;
        if (token.includes('|')) {
            const parts = token.split('|');
            if (parts.length < 2 || !parts[1]) {
                req.user = null;
                return next();
            }
            jwtToken = parts[1];
        }
        else {
            jwtToken = token;
        }
        const decoded = jsonwebtoken_1.default.verify(jwtToken, 'fallback-secret');
        const user = await User_1.default.findByPk(decoded.id, {
            attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'is_active'],
        });
        if (!user) {
            req.user = null;
            return next();
        }
        if (user.is_active !== 1) {
            req.user = null;
            return next();
        }
        req.user = user;
        return next();
    }
    catch (error) {
        req.user = null;
        return next();
    }
};
exports.optionalAuth = optionalAuth;
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        let jwtToken = token;
        if (token && token.includes('|')) {
            jwtToken = token.split('|')[1];
        }
        if (!jwtToken) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        const decoded = jsonwebtoken_1.default.verify(jwtToken, 'fallback-secret');
        const user = await User_1.default.findByPk(decoded.id, {
            attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'is_active'],
        });
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        if (user.is_active !== 1) {
            return res.status(401).json({ message: 'Account is not active' });
        }
        if (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'engineer' && user.role !== 'ENGINEER') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        req.user = user;
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
};
exports.adminAuth = adminAuth;
const engineerAuth = async (req, res, next) => {
    try {
        await new Promise((resolve, reject) => {
            (0, exports.auth)(req, res, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
        if (!['ADMIN', 'ENGINEER'].includes(req.user?.role)) {
            return res.status(403).json({ message: 'Access denied. Engineer or Admin only.' });
        }
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Authentication failed' });
    }
};
exports.engineerAuth = engineerAuth;
//# sourceMappingURL=auth.js.map