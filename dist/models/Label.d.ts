import { Model, Optional } from 'sequelize';
interface LabelAttributes {
    id: number;
    name: string;
    is_active: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface LabelCreationAttributes extends Optional<LabelAttributes, 'id' | 'is_active' | 'createdAt' | 'updatedAt'> {
}
declare class Label extends Model<LabelAttributes, LabelCreationAttributes> implements LabelAttributes {
    id: number;
    name: string;
    is_active: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Label;
//# sourceMappingURL=Label.d.ts.map