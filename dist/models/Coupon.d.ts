import { Model, Optional } from 'sequelize';
interface CouponAttributes {
    id: number;
    code: string;
    discount_type: string;
    discount_value: number;
    max_uses: number | null;
    uses: number;
    is_active: number;
    start_date: Date;
    end_date: Date | null;
    product_ids: string | null;
    coupon_type: number;
    created_at?: Date;
    updated_at?: Date;
}
interface CouponCreationAttributes extends Optional<CouponAttributes, 'id' | 'uses' | 'is_active' | 'created_at' | 'updated_at'> {
}
declare class Coupon extends Model<CouponAttributes, CouponCreationAttributes> implements CouponAttributes {
    id: number;
    code: string;
    discount_type: string;
    discount_value: number;
    max_uses: number | null;
    uses: number;
    is_active: number;
    start_date: Date;
    end_date: Date | null;
    product_ids: string | null;
    coupon_type: number;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default Coupon;
//# sourceMappingURL=Coupon.d.ts.map