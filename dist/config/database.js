"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const requiredEnvVars = [
    'DB_DATABASE',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_HOST',
    'DB_PORT'
];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}
const sequelize = new sequelize_1.Sequelize(process.env['DB_DATABASE'], process.env['DB_USERNAME'], process.env['DB_PASSWORD'], {
    host: process.env['DB_HOST'],
    port: parseInt(process.env['DB_PORT']),
    dialect: 'mysql',
    logging: process.env['NODE_ENV'] === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    define: {
        timestamps: true,
        underscored: true,
    },
});
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
        if (process.env['NODE_ENV'] === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ Database models synchronized');
        }
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
exports.default = sequelize;
//# sourceMappingURL=database.js.map