import { Model } from 'sequelize';
export interface BlogAttributes {
    id: number;
    title: string;
    slug: string;
    author_name: string;
    publish_date: Date;
    read_time: number;
    content: string;
    html_content: string;
    keywords?: string;
    meta_description?: string;
    featured_image?: string;
    category_id: number;
    is_published: number;
    views: number;
    created_at?: Date;
    updated_at?: Date;
}
export interface BlogCreationAttributes extends Omit<BlogAttributes, 'id' | 'views' | 'created_at' | 'updated_at'> {
}
export declare class Blog extends Model<BlogAttributes, BlogCreationAttributes> implements BlogAttributes {
    id: number;
    title: string;
    slug: string;
    author_name: string;
    publish_date: Date;
    read_time: number;
    content: string;
    html_content: string;
    keywords?: string;
    meta_description?: string;
    featured_image?: string;
    category_id: number;
    is_published: number;
    views: number;
    readonly created_at: Date;
    readonly updated_at: Date;
}
//# sourceMappingURL=Blog.d.ts.map