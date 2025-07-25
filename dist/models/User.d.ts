import { Model, Optional } from 'sequelize';
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
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'is_active' | 'createdAt' | 'updatedAt' | 'email_verified_at' | 'email_verification_token' | 'remember_token'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    hashPassword(): Promise<void>;
}
export default User;
//# sourceMappingURL=User.d.ts.map