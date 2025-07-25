"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = exports.Order = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
const Service_1 = __importDefault(require("./Service"));
const OrderCoupon_1 = __importDefault(require("./OrderCoupon"));
const Revision_1 = __importDefault(require("./Revision"));
class Order extends sequelize_1.Model {
}
exports.Order = Order;
Order.init({
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
    transaction_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    currency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    promocode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    payer_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    payer_email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    payment_status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    Order_status: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    order_type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    is_active: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: false,
    },
    payment_method: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    order_reference_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    tableName: 'orders',
});
class OrderItem extends sequelize_1.Model {
}
exports.OrderItem = OrderItem;
OrderItem.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    order_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'orders',
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
    paypal_product_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    paypal_plan_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    quantity: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    total_price: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    service_type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    max_revision: {
        type: sequelize_1.DataTypes.BIGINT,
        defaultValue: 3,
        allowNull: false,
    },
    deliverable_files: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    admin_is_read: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: false,
    },
    user_is_read: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'order_items',
});
Order.belongsTo(User_1.default, { foreignKey: 'user_id', as: 'user' });
User_1.default.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'orderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Service_1.default, { foreignKey: 'service_id', as: 'service' });
Service_1.default.hasMany(OrderItem, { foreignKey: 'service_id', as: 'orderItems' });
Order.hasMany(OrderCoupon_1.default, { foreignKey: 'order_id', as: 'orderCoupons' });
OrderCoupon_1.default.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Order.hasMany(Revision_1.default, { foreignKey: 'order_id', as: 'revisions' });
Revision_1.default.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
//# sourceMappingURL=Order.js.map