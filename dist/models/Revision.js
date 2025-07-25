"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Revision extends sequelize_1.Model {
}
Revision.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    order_id: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id',
        },
    },
    user_id: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    service_id: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'services',
            key: 'id',
        },
    },
    message: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true,
    },
    files: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true,
    },
    transaction_id: {
        type: sequelize_1.DataTypes.STRING(225),
        allowNull: true,
    },
    amount: {
        type: sequelize_1.DataTypes.STRING(225),
        allowNull: true,
    },
    payer_name: {
        type: sequelize_1.DataTypes.STRING(225),
        allowNull: true,
    },
    payer_email: {
        type: sequelize_1.DataTypes.STRING(225),
        allowNull: true,
    },
    payment_method: {
        type: sequelize_1.DataTypes.STRING(225),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(225),
        allowNull: false,
        defaultValue: 'free',
    },
    admin_is_read: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
    },
    user_is_read: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    tableName: 'revisions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = Revision;
//# sourceMappingURL=Revision.js.map