import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface GalleryAttributes {
  id: number;
  image: string;
  is_active: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GalleryCreationAttributes extends Optional<GalleryAttributes, 'id' | 'is_active' | 'createdAt' | 'updatedAt'> {}

class Gallery extends Model<GalleryAttributes, GalleryCreationAttributes> implements GalleryAttributes {
  public id!: number;
  public image!: string;
  public is_active!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Gallery.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'gallaries',
  }
);

export default Gallery; 