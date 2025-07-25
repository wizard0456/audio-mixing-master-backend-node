import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface BlogCategoryAttributes {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface BlogCategoryCreationAttributes extends Omit<BlogCategoryAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class BlogCategory extends Model<BlogCategoryAttributes, BlogCategoryCreationAttributes> implements BlogCategoryAttributes {
  public id!: number;
  public name!: string;
  public slug!: string;
  public description?: string;
  public is_active!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

BlogCategory.init(
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
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
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
    tableName: 'blog_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
); 