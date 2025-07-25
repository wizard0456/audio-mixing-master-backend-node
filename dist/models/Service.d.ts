import { Model, Optional } from 'sequelize';
import Category from './Category';
import Label from './Label';
interface ServiceAttributes {
    id: number;
    category_id: number;
    label_id: number;
    parent_id: number;
    paypal_product_id?: string;
    paypal_plan_id?: string;
    stripe_product_id?: string;
    stripe_plan_id?: string;
    name: string;
    image: string;
    is_url: number;
    price?: number;
    discounted_price?: number;
    service_type: string;
    detail: string;
    brief_detail?: string;
    includes?: string;
    description?: string;
    requirements?: string;
    notes?: string;
    tags?: string;
    is_active: number;
    is_variation: number;
    detail_data?: string;
    is_session: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'is_active' | 'is_variation' | 'is_session' | 'createdAt' | 'updatedAt'> {
}
declare class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
    id: number;
    category_id: number;
    label_id: number;
    parent_id: number;
    paypal_product_id?: string;
    paypal_plan_id?: string;
    stripe_product_id?: string;
    stripe_plan_id?: string;
    name: string;
    image: string;
    is_url: number;
    price?: number;
    discounted_price?: number;
    service_type: string;
    detail: string;
    brief_detail?: string;
    includes?: string;
    description?: string;
    requirements?: string;
    notes?: string;
    tags?: string;
    is_active: number;
    is_variation: number;
    detail_data?: string;
    is_session: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly category?: Category;
    readonly label?: Label;
}
export default Service;
//# sourceMappingURL=Service.d.ts.map