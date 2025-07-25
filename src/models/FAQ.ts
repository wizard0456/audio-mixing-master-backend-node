import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FAQAttributes {
  id: number;
  category: string;
  question: string;
  answer: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

interface FAQCreationAttributes extends Optional<FAQAttributes, 'id' | 'status' | 'created_at' | 'updated_at'> {}

class FAQ extends Model<FAQAttributes, FAQCreationAttributes> implements FAQAttributes {
  public id!: number;
  public category!: string;
  public question!: string;
  public answer!: string;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FAQ.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category: {
      type: DataTypes.STRING(225),
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'faqs',
  }
);

export default FAQ; 