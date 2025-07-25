import { Model, Optional } from 'sequelize';
interface TagAttributes {
    id: number;
    tag_name: string;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}
interface TagCreationAttributes extends Optional<TagAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {
}
declare class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
    id: number;
    tag_name: string;
    is_active: boolean;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default Tag;
//# sourceMappingURL=Tag.d.ts.map