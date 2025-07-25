import { Model, Optional } from 'sequelize';
interface GiftAttributes {
    id: number;
    name: string;
    price: number;
    details?: string;
    image?: string;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}
interface GiftCreationAttributes extends Optional<GiftAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {
}
declare class Gift extends Model<GiftAttributes, GiftCreationAttributes> implements GiftAttributes {
    id: number;
    name: string;
    price: number;
    details?: string;
    image?: string;
    is_active: boolean;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default Gift;
//# sourceMappingURL=Gift.d.ts.map