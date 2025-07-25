import { Model, Optional } from 'sequelize';
import User from './User';
import Service from './Service';
interface CartAttributes {
    id: number;
    user_id: number;
    service_id: number;
    price: string;
    qty: string;
    total_price: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface CartCreationAttributes extends Optional<CartAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
    id: number;
    user_id: number;
    service_id: number;
    price: string;
    qty: string;
    total_price: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly user?: User;
    readonly service?: Service;
}
export default Cart;
//# sourceMappingURL=Cart.d.ts.map