import { Model, Optional } from 'sequelize';
import User from './User';
import Service from './Service';
interface OrderAttributes {
    id: number;
    user_id: number;
    transaction_id: string;
    amount: number;
    currency: string;
    promocode?: string;
    payer_name?: string;
    payer_email?: string;
    payment_status?: string;
    Order_status: number;
    order_type: string;
    is_active: number;
    payment_method?: string;
    order_reference_id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'Order_status' | 'is_active' | 'createdAt' | 'updatedAt'> {
}
declare class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
    id: number;
    user_id: number;
    transaction_id: string;
    amount: number;
    currency: string;
    promocode?: string;
    payer_name?: string;
    payer_email?: string;
    payment_status?: string;
    Order_status: number;
    order_type: string;
    is_active: number;
    payment_method?: string;
    order_reference_id?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly user?: User;
    readonly orderItems?: OrderItem[];
}
interface OrderItemAttributes {
    id: number;
    order_id: number;
    service_id: number;
    paypal_product_id?: string;
    paypal_plan_id?: string;
    name: string;
    price?: string;
    quantity: string;
    total_price?: string;
    service_type: string;
    max_revision: number;
    deliverable_files?: string;
    admin_is_read: number;
    user_is_read: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'max_revision' | 'admin_is_read' | 'user_is_read' | 'createdAt' | 'updatedAt'> {
}
declare class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
    id: number;
    order_id: number;
    service_id: number;
    paypal_product_id?: string;
    paypal_plan_id?: string;
    name: string;
    price?: string;
    quantity: string;
    total_price?: string;
    service_type: string;
    max_revision: number;
    deliverable_files?: string;
    admin_is_read: number;
    user_is_read: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly service?: Service;
}
export { Order, OrderItem };
//# sourceMappingURL=Order.d.ts.map