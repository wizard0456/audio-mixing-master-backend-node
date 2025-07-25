import { Model, Optional } from 'sequelize';
interface GalleryAttributes {
    id: number;
    image: string;
    is_active: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface GalleryCreationAttributes extends Optional<GalleryAttributes, 'id' | 'is_active' | 'createdAt' | 'updatedAt'> {
}
declare class Gallery extends Model<GalleryAttributes, GalleryCreationAttributes> implements GalleryAttributes {
    id: number;
    image: string;
    is_active: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Gallery;
//# sourceMappingURL=Gallery.d.ts.map