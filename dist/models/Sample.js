"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Sample extends sequelize_1.Model {
}
Sample.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    before_audio: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    after_audio: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    is_active: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'samples',
});
exports.default = Sample;
//# sourceMappingURL=Sample.js.map