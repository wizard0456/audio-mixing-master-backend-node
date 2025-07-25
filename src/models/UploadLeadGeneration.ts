import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UploadLeadGenerationAttributes {
  id: number;
  name: string;
  email: string;
  arlist_name: string;
  tarck_title: string;
  image: string; // Single image path/URL (varchar 255)
  services: string;
  reference: string;
  file_type: number; // 0 for URL, 1 for uploaded file
  createdAt?: Date;
  updatedAt?: Date;
}

interface UploadLeadGenerationCreationAttributes extends Optional<UploadLeadGenerationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class UploadLeadGeneration extends Model<UploadLeadGenerationAttributes, UploadLeadGenerationCreationAttributes> implements UploadLeadGenerationAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public arlist_name!: string;
  public tarck_title!: string;
  public image!: string;
  public services!: string;
  public reference!: string;
  public file_type!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UploadLeadGeneration.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    arlist_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tarck_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    services: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    reference: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_type: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'upload_lead_generations',
  }
);

export default UploadLeadGeneration; 