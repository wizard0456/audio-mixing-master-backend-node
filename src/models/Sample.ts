import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SampleAttributes {
  id: number;
  name: string;
  before_audio: string;
  after_audio: string;
  is_active: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SampleCreationAttributes extends Optional<SampleAttributes, 'id' | 'is_active' | 'createdAt' | 'updatedAt'> {}

class Sample extends Model<SampleAttributes, SampleCreationAttributes> implements SampleAttributes {
  public id!: number;
  public name!: string;
  public before_audio!: string;
  public after_audio!: string;
  public is_active!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Sample.init(
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
    before_audio: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    after_audio: {
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
    tableName: 'samples',
  }
);

export default Sample; 