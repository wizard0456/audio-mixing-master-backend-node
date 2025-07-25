import { Model, Optional } from 'sequelize';
interface SampleAttributes {
    id: number;
    name: string;
    before_audio: string;
    after_audio: string;
    is_active: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface SampleCreationAttributes extends Optional<SampleAttributes, 'id' | 'is_active' | 'createdAt' | 'updatedAt'> {
}
declare class Sample extends Model<SampleAttributes, SampleCreationAttributes> implements SampleAttributes {
    id: number;
    name: string;
    before_audio: string;
    after_audio: string;
    is_active: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Sample;
//# sourceMappingURL=Sample.d.ts.map