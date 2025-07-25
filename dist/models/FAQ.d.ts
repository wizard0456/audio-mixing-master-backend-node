import { Model, Optional } from 'sequelize';
interface FAQAttributes {
    id: number;
    category: string;
    question: string;
    answer: string;
    status: number;
    created_at?: Date;
    updated_at?: Date;
}
interface FAQCreationAttributes extends Optional<FAQAttributes, 'id' | 'status' | 'created_at' | 'updated_at'> {
}
declare class FAQ extends Model<FAQAttributes, FAQCreationAttributes> implements FAQAttributes {
    id: number;
    category: string;
    question: string;
    answer: string;
    status: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default FAQ;
//# sourceMappingURL=FAQ.d.ts.map