import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Service from './Service';

interface CartAttributes {
  id: number;
  user_id: number;
  service_id: number;
  price: string;
  qty: string;
  total_price: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CartCreationAttributes extends Optional<CartAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  public id!: number;
  public user_id!: number;
  public service_id!: number;
  public price!: string;
  public qty!: string;
  public total_price!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;
  public readonly service?: Service;
}

Cart.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    service_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'services',
        key: 'id',
      },
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qty: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'carts',
  }
);

// Define associations
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' });

Cart.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
Service.hasMany(Cart, { foreignKey: 'service_id', as: 'cartItems' });

export default Cart; 