import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ContactLeadGenerationAttributes {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContactLeadGenerationCreationAttributes extends Optional<ContactLeadGenerationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class ContactLeadGeneration extends Model<ContactLeadGenerationAttributes, ContactLeadGenerationCreationAttributes> implements ContactLeadGenerationAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public subject!: string;
  public message!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ContactLeadGeneration.init(
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
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'contact_lead_generations',
  }
);

export default ContactLeadGeneration; 