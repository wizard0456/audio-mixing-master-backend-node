"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
const Service_1 = __importDefault(require("./Service"));
class Favourite extends sequelize_1.Model {
}
Favourite.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    service_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'services',
            key: 'id',
        },
    },
}, {
    sequelize: database_1.default,
    tableName: 'favourites',
    timestamps: true,
    underscored: true,
});
Favourite.belongsTo(User_1.default, { foreignKey: 'user_id', as: 'user' });
Favourite.belongsTo(Service_1.default, { foreignKey: 'service_id', as: 'service' });
User_1.default.hasMany(Favourite, { foreignKey: 'user_id', as: 'favourites' });
Service_1.default.hasMany(Favourite, { foreignKey: 'service_id', as: 'favourites' });
exports.default = Favourite;
//# sourceMappingURL=Favourite.js.map