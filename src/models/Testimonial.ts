import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface TestimonialAttributes {
  id: number;
  user_id?: number;
  user_name: string;
  text: string;
  img_url: string;
  site_url: string;
  ratings: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TestimonialCreationAttributes extends Optional<TestimonialAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Testimonial extends Model<TestimonialAttributes, TestimonialCreationAttributes> implements TestimonialAttributes {
  public id!: number;
  public user_id?: number;
  public user_name!: string;
  public text!: string;
  public img_url!: string;
  public site_url!: string;
  public ratings!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;
}

Testimonial.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    img_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    site_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ratings: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'testimonials',
  }
);

// Define associations
Testimonial.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Testimonial, { foreignKey: 'user_id', as: 'testimonials' });

export default Testimonial; 