import { Model } from 'sequelize';
export interface BlogCategoryAttributes {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_active: number;
    created_at?: Date;
    updated_at?: Date;
}
export interface BlogCategoryCreationAttributes extends Omit<BlogCategoryAttributes, 'id' | 'created_at' | 'updated_at'> {
}
export declare class BlogCategory extends Model<BlogCategoryAttributes, BlogCategoryCreationAttributes> implements BlogCategoryAttributes {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_active: number;
    readonly created_at: Date;
    readonly updated_at: Date;
}
//# sourceMappingURL=BlogCategory.d.ts.map