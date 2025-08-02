"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
const Service_1 = __importDefault(require("./Service"));
class Cart extends sequelize_1.Model {
}
Cart.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    service_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'services',
            key: 'id',
        },
    },
    price: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    qty: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    total_price: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'carts',
});
// Define associations
Cart.belongsTo(User_1.default, { foreignKey: 'user_id', as: 'user' });
User_1.default.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' });
Cart.belongsTo(Service_1.default, { foreignKey: 'service_id', as: 'service' });
Service_1.default.hasMany(Cart, { foreignKey: 'service_id', as: 'cartItems' });
exports.default = Cart;
