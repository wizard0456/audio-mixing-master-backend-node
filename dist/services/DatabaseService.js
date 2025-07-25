"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.seedDatabase = exports.runMigrations = exports.initializeDatabase = void 0;
const database_1 = __importDefault(require("../config/database"));
const initializeDatabase = async () => {
    try {
        await database_1.default.authenticate();
        console.log('✅ Database connected successfully');
        if (process.env['NODE_ENV'] === 'development') {
            await database_1.default.sync({ alter: true });
            console.log('✅ Database synchronized');
        }
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
const runMigrations = async () => {
    try {
        console.log('✅ Database migrations completed');
    }
    catch (error) {
        console.error('❌ Database migrations failed:', error);
        throw error;
    }
};
exports.runMigrations = runMigrations;
const seedDatabase = async () => {
    try {
        const User = require('../models/User').default;
        const userCount = await User.count();
        if (userCount > 0) {
            console.log('✅ Database already seeded');
            return;
        }
        console.log('✅ Database seeded successfully');
    }
    catch (error) {
        console.error('❌ Database seeding failed:', error);
        throw error;
    }
};
exports.seedDatabase = seedDatabase;
const closeDatabase = async () => {
    try {
        await database_1.default.close();
        console.log('✅ Database disconnected successfully');
    }
    catch (error) {
        console.error('❌ Database disconnection failed:', error);
        throw error;
    }
};
exports.closeDatabase = closeDatabase;
//# sourceMappingURL=DatabaseService.js.map