import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface GiftAttributes {
  id: number;
  name: string;
  price: number;
  details?: string;
  image?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface GiftCreationAttributes extends Optional<GiftAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

class Gift extends Model<GiftAttributes, GiftCreationAttributes> implements GiftAttributes {
  public id!: number;
  public name!: string;
  public price!: number;
  public details?: string;
  public image?: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Gift.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'gifts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Gift; 