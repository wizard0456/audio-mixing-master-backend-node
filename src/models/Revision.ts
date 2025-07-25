import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface RevisionAttributes {
  id: number;
  order_id: number;
  user_id: number;
  service_id: number;
  message: string | null;
  files: string | null;
  transaction_id: string | null;
  amount: string | null;
  payer_name: string | null;
  payer_email: string | null;
  payment_method: string | null;
  status: string;
  admin_is_read: number;
  user_is_read: number;
  created_at?: Date;
  updated_at?: Date;
}

interface RevisionCreationAttributes extends Optional<RevisionAttributes, 'id' | 'message' | 'files' | 'transaction_id' | 'amount' | 'payer_name' | 'payer_email' | 'payment_method' | 'admin_is_read' | 'user_is_read' | 'created_at' | 'updated_at'> {}

class Revision extends Model<RevisionAttributes, RevisionCreationAttributes> implements RevisionAttributes {
  public id!: number;
  public order_id!: number;
  public user_id!: number;
  public service_id!: number;
  public message!: string | null;
  public files!: string | null;
  public transaction_id!: string | null;
  public amount!: string | null;
  public payer_name!: string | null;
  public payer_email!: string | null;
  public payment_method!: string | null;
  public status!: string;
  public admin_is_read!: number;
  public user_is_read!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Revision.init(
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
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    service_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'services',
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    files: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    transaction_id: {
      type: DataTypes.STRING(225),
      allowNull: true,
    },
    amount: {
      type: DataTypes.STRING(225),
      allowNull: true,
    },
    payer_name: {
      type: DataTypes.STRING(225),
      allowNull: true,
    },
    payer_email: {
      type: DataTypes.STRING(225),
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.STRING(225),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(225),
      allowNull: false,
      defaultValue: 'free',
    },
    admin_is_read: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    user_is_read: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
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
    tableName: 'revisions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Revision; 