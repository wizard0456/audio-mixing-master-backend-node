import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { BlogCategory } from './BlogCategory';

export interface BlogAttributes {
  id: number;
  title: string;
  slug: string;
  author_name: string;
  publish_date: Date;
  read_time: number;
  content: string;
  html_content: string;
  keywords?: string;
  meta_description?: string;
  featured_image?: string;
  category_id: number;
  is_published: number;
  views: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface BlogCreationAttributes extends Omit<BlogAttributes, 'id' | 'views' | 'created_at' | 'updated_at'> {}

export class Blog extends Model<BlogAttributes, BlogCreationAttributes> implements BlogAttributes {
  public id!: number;
  public title!: string;
  public slug!: string;
  public author_name!: string;
  public publish_date!: Date;
  public read_time!: number;
  public content!: string;
  public html_content!: string;
  public keywords?: string;
  public meta_description?: string;
  public featured_image?: string;
  public category_id!: number;
  public is_published!: number;
  public views!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Blog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    author_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    publish_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    read_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    html_content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    keywords: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    featured_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'blog_categories',
        key: 'id',
      },
    },
    is_published: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'blogs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
Blog.belongsTo(BlogCategory, { foreignKey: 'category_id', as: 'category' }); 