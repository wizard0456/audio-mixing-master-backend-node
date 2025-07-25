import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface OrderCouponAttributes {
  id: number;
  order_id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  product_ids: string | null;
  created_at?: Date;
  updated_at?: Date;
}

interface OrderCouponCreationAttributes extends Optional<OrderCouponAttributes, 'id' | 'product_ids' | 'created_at' | 'updated_at'> {}

class OrderCoupon extends Model<OrderCouponAttributes, OrderCouponCreationAttributes> implements OrderCouponAttributes {
  public id!: number;
  public order_id!: number;
  public code!: string;
  public discount_type!: 'percentage' | 'fixed';
  public discount_value!: number;
  public product_ids!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

OrderCoupon.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    product_ids: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'order_coupons',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default OrderCoupon; 