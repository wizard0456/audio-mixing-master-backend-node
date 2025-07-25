import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface LabelAttributes {
  id: number;
  name: string;
  is_active: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LabelCreationAttributes extends Optional<LabelAttributes, 'id' | 'is_active' | 'createdAt' | 'updatedAt'> {}

class Label extends Model<LabelAttributes, LabelCreationAttributes> implements LabelAttributes {
  public id!: number;
  public name!: string;
  public is_active!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Label.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
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
    tableName: 'labels',
  }
);

export default Label; 