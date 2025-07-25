import { Model, Optional } from 'sequelize';
interface ContactLeadGenerationAttributes {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface ContactLeadGenerationCreationAttributes extends Optional<ContactLeadGenerationAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class ContactLeadGeneration extends Model<ContactLeadGenerationAttributes, ContactLeadGenerationCreationAttributes> implements ContactLeadGenerationAttributes {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default ContactLeadGeneration;
//# sourceMappingURL=ContactLeadGeneration.d.ts.map