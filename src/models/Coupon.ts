import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CouponAttributes {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  uses: number;
  is_active: number;
  start_date: Date;
  end_date: Date | null;
  product_ids: string | null;
  coupon_type: number;
  created_at?: Date;
  updated_at?: Date;
}

interface CouponCreationAttributes extends Optional<CouponAttributes, 'id' | 'uses' | 'is_active' | 'created_at' | 'updated_at'> {}

class Coupon extends Model<CouponAttributes, CouponCreationAttributes> implements CouponAttributes {
  public id!: number;
  public code!: string;
  public discount_type!: string;
  public discount_value!: number;
  public max_uses!: number | null;
  public uses!: number;
  public is_active!: number;
  public start_date!: Date;
  public end_date!: Date | null;
  public product_ids!: string | null;
  public coupon_type!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Coupon.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(225),
      allowNull: false,
      unique: true,
    },
    discount_type: {
      type: DataTypes.STRING(225),
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    max_uses: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    uses: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    product_ids: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    coupon_type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '0->complete, 1->product_ids',
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
    tableName: 'coupons',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Coupon; 