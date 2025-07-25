import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TagAttributes {
  id: number;
  tag_name: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface TagCreationAttributes extends Optional<TagAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
  public id!: number;
  public tag_name!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Tag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tag_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    tableName: 'tags',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Tag; 