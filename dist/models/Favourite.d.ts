import { Model } from 'sequelize';
declare class Favourite extends Model {
    id: number;
    user_id: number;
    service_id: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Favourite;
//# sourceMappingURL=Favourite.d.ts.map