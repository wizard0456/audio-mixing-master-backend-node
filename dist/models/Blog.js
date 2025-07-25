"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blog = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const BlogCategory_1 = require("./BlogCategory");
class Blog extends sequelize_1.Model {
}
exports.Blog = Blog;
Blog.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: false,
    },
    slug: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: false,
        unique: true,
    },
    author_name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    publish_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    read_time: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    html_content: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: false,
    },
    keywords: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    meta_description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    featured_image: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'blog_categories',
            key: 'id',
        },
    },
    is_published: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
    },
    views: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    tableName: 'blogs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
Blog.belongsTo(BlogCategory_1.BlogCategory, { foreignKey: 'category_id', as: 'category' });
//# sourceMappingURL=Blog.js.map