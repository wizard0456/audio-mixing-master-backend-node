"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class UploadLeadGeneration extends sequelize_1.Model {
}
UploadLeadGeneration.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    arlist_name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    tarck_title: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    image: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    services: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    reference: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    file_type: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'upload_lead_generations',
});
exports.default = UploadLeadGeneration;
//# sourceMappingURL=UploadLeadGeneration.js.map