"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class FAQ extends sequelize_1.Model {
}
FAQ.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    category: {
        type: sequelize_1.DataTypes.STRING(225),
        allowNull: false,
    },
    question: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: false,
    },
    answer: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'faqs',
});
exports.default = FAQ;
//# sourceMappingURL=FAQ.js.map