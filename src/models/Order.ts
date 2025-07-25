import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Service from './Service';
import OrderCoupon from './OrderCoupon';
import Revision from './Revision';

interface OrderAttributes {
  id: number;
  user_id: number;
  transaction_id: string;
  amount: number;
  currency: string;
  promocode?: string;
  payer_name?: string;
  payer_email?: string;
  payment_status?: string;
  Order_status: number;
  order_type: string;
  is_active: number;
  payment_method?: string;
  order_reference_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'Order_status' | 'is_active' | 'createdAt' | 'updatedAt'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public user_id!: number;
  public transaction_id!: string;
  public amount!: number;
  public currency!: string;
  public promocode?: string;
  public payer_name?: string;
  public payer_email?: string;
  public payment_status?: string;
  public Order_status!: number;
  public order_type!: string;
  public is_active!: number;
  public payment_method?: string;
  public order_reference_id?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;
  public readonly orderItems?: OrderItem[];
}

Order.init(
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
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    promocode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payer_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Order_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    order_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    order_reference_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'orders',
  }
);

// OrderItem junction table
interface OrderItemAttributes {
  id: number;
  order_id: number;
  service_id: number;
  paypal_product_id?: string;
  paypal_plan_id?: string;
  name: string;
  price?: string;
  quantity: string;
  total_price?: string;
  service_type: string;
  max_revision: number;
  deliverable_files?: string;
  admin_is_read: number;
  user_is_read: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'max_revision' | 'admin_is_read' | 'user_is_read' | 'createdAt' | 'updatedAt'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number;
  public order_id!: number;
  public service_id!: number;
  public paypal_product_id?: string;
  public paypal_plan_id?: string;
  public name!: string;
  public price?: string;
  public quantity!: string;
  public total_price?: string;
  public service_type!: string;
  public max_revision!: number;
  public deliverable_files?: string;
  public admin_is_read!: number;
  public user_is_read!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly service?: Service;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'orders',
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
    paypal_product_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paypal_plan_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    max_revision: {
      type: DataTypes.BIGINT,
      defaultValue: 3,
      allowNull: false,
    },
    deliverable_files: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    admin_is_read: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
    },
    user_is_read: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'order_items',
  }
);

// Define associations
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'orderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

OrderItem.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
Service.hasMany(OrderItem, { foreignKey: 'service_id', as: 'orderItems' });

// OrderCoupon associations
Order.hasMany(OrderCoupon, { foreignKey: 'order_id', as: 'orderCoupons' });
OrderCoupon.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Revision associations
Order.hasMany(Revision, { foreignKey: 'order_id', as: 'revisions' });
Revision.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

export { Order, OrderItem }; 