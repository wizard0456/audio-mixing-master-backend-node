import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';
import Label from './Label';
import Revision from './Revision';

interface ServiceAttributes {
  id: number;
  category_id: number;
  label_id: number;
  parent_id: number;
  paypal_product_id?: string;
  paypal_plan_id?: string;
  stripe_product_id?: string;
  stripe_plan_id?: string;
  name: string;
  image: string;
  is_url: number;
  price?: number;
  discounted_price?: number;
  service_type: string;
  detail: string;
  brief_detail?: string;
  includes?: string;
  description?: string;
  requirements?: string;
  notes?: string;
  tags?: string;
  is_active: number;
  is_variation: number;
  detail_data?: string;
  is_session: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'is_active' | 'is_variation' | 'is_session' | 'createdAt' | 'updatedAt'> {}

class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
  public id!: number;
  public category_id!: number;
  public label_id!: number;
  public parent_id!: number;
  public paypal_product_id?: string;
  public paypal_plan_id?: string;
  public stripe_product_id?: string;
  public stripe_plan_id?: string;
  public name!: string;
  public image!: string;
  public is_url!: number;
  public price?: number;
  public discounted_price?: number;
  public service_type!: string;
  public detail!: string;
  public brief_detail?: string;
  public includes?: string;
  public description?: string;
  public requirements?: string;
  public notes?: string;
  public tags?: string;
  public is_active!: number;
  public is_variation!: number;
  public detail_data?: string;
  public is_session!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly category?: Category;
  public readonly label?: Label;
}

Service.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    label_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'labels',
        key: 'id',
      },
    },
    parent_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
    },
    paypal_product_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paypal_plan_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripe_product_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripe_plan_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_url: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    discounted_price: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    service_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    brief_detail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    includes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    },
    is_variation: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    },
    detail_data: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_session: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'services',
  }
);

// Define associations
Service.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Service, { foreignKey: 'category_id', as: 'services' });
Service.belongsTo(Label, { foreignKey: 'label_id', as: 'label' });
Label.hasMany(Service, { foreignKey: 'label_id', as: 'services' });

// Revision associations
Service.hasMany(Revision, { foreignKey: 'service_id', as: 'revisions' });
Revision.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

export default Service; 