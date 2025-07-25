"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Revision_1 = __importDefault(require("./Revision"));
class User extends sequelize_1.Model {
    async comparePassword(candidatePassword) {
        return bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    async hashPassword() {
        if (this.changed('password')) {
            const salt = await bcryptjs_1.default.genSalt(parseInt(process.env['BCRYPT_ROUNDS'] || '12'));
            this.password = await bcryptjs_1.default.hash(this.password, salt);
        }
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    first_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    avatar: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    email_verified_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    email_verification_token: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    phone_number: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'user',
        allowNull: false,
    },
    is_active: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: false,
    },
    remember_token: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    tableName: 'users',
    hooks: {
        beforeCreate: async (user) => {
            await user.hashPassword();
        },
        beforeUpdate: async (user) => {
            await user.hashPassword();
        },
    },
});
User.hasMany(Revision_1.default, { foreignKey: 'user_id', as: 'revisions' });
Revision_1.default.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
exports.default = User;
//# sourceMappingURL=User.js.map