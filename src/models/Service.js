"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Category_1 = __importDefault(require("./Category"));
const Label_1 = __importDefault(require("./Label"));
const Revision_1 = __importDefault(require("./Revision"));
class Service extends sequelize_1.Model {
}
Service.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    category_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id',
        },
    },
    label_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'labels',
            key: 'id',
        },
    },
    parent_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
    },
    paypal_product_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    paypal_plan_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    stripe_product_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    stripe_plan_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    is_url: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: false,
    },
    price: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: true,
    },
    discounted_price: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: true,
    },
    service_type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    detail: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    brief_detail: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    includes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    requirements: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    tags: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    is_active: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: false,
    },
    is_variation: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: false,
    },
    detail_data: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    is_session: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'services',
});
// Define associations
Service.belongsTo(Category_1.default, { foreignKey: 'category_id', as: 'category' });
Category_1.default.hasMany(Service, { foreignKey: 'category_id', as: 'services' });
Service.belongsTo(Label_1.default, { foreignKey: 'label_id', as: 'label' });
Label_1.default.hasMany(Service, { foreignKey: 'label_id', as: 'services' });
// Revision associations
Service.hasMany(Revision_1.default, { foreignKey: 'service_id', as: 'revisions' });
Revision_1.default.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
exports.default = Service;
