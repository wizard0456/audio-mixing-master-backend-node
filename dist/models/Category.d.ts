import { Model, Optional } from 'sequelize';
interface CategoryAttributes {
    id: number;
    name: string;
    is_active: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'is_active' | 'createdAt' | 'updatedAt'> {
}
declare class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    id: number;
    name: string;
    is_active: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Category;
//# sourceMappingURL=Category.d.ts.map