import { Model, Optional } from 'sequelize';
interface PaymentAttributes {
    id: number;
    payment_id: string;
    product_name: string;
    quantity: string;
    amount: string;
    currency: string;
    payer_name: string;
    payer_email: string;
    payment_status: string;
    payment_method: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
    id: number;
    payment_id: string;
    product_name: string;
    quantity: string;
    amount: string;
    currency: string;
    payer_name: string;
    payer_email: string;
    payment_status: string;
    payment_method: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Payment;
//# sourceMappingURL=Payment.d.ts.map