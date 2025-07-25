import { Model, Optional } from 'sequelize';
interface OrderCouponAttributes {
    id: number;
    order_id: number;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    product_ids: string | null;
    created_at?: Date;
    updated_at?: Date;
}
interface OrderCouponCreationAttributes extends Optional<OrderCouponAttributes, 'id' | 'product_ids' | 'created_at' | 'updated_at'> {
}
declare class OrderCoupon extends Model<OrderCouponAttributes, OrderCouponCreationAttributes> implements OrderCouponAttributes {
    id: number;
    order_id: number;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    product_ids: string | null;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default OrderCoupon;
//# sourceMappingURL=OrderCoupon.d.ts.map