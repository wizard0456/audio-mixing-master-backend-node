import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PaymentAttributes {
  id: number;
  payment_id: string;
  product_name: string;
  quantity: string;
  amount: string;
  currency: string;
  payer_name: string;
  payer_email: string;
  payment_status: string;
  payment_method: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: number;
  public payment_id!: string;
  public product_name!: string;
  public quantity!: string;
  public amount!: string;
  public currency!: string;
  public payer_name!: string;
  public payer_email!: string;
  public payment_status!: string;
  public payment_method!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    payment_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payer_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payer_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'payments',
  }
);

export default Payment; 