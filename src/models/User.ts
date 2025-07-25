import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';
import Revision from './Revision';

interface UserAttributes {
  id: number;
  avatar?: string;
  first_name: string;
  last_name: string;
  email: string;
  email_verified_at?: Date;
  email_verification_token?: string;
  phone_number?: string;
  password: string;
  role: string;
  is_active: number;
  remember_token?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'is_active' | 'createdAt' | 'updatedAt' | 'email_verified_at' | 'email_verification_token' | 'remember_token'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public avatar?: string;
  public first_name!: string;
  public last_name!: string;
  public email!: string;
  public email_verified_at?: Date;
  public email_verification_token?: string;
  public phone_number?: string;
  public password!: string;
  public role!: string;
  public is_active!: number;
  public remember_token?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public async hashPassword(): Promise<void> {
    if (this.changed('password')) {
      const salt = await bcrypt.genSalt(parseInt(process.env['BCRYPT_ROUNDS'] || '12'));
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    email_verification_token: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user',
      allowNull: false,
    },
    is_active: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
    },
    remember_token: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user: User) => {
        await user.hashPassword();
      },
      beforeUpdate: async (user: User) => {
        await user.hashPassword();
      },
    },
  }
);

// Define associations
User.hasMany(Revision, { foreignKey: 'user_id', as: 'revisions' });
Revision.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default User; 