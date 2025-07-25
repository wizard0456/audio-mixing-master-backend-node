import { Model, Optional } from 'sequelize';
interface RevisionAttributes {
    id: number;
    order_id: number;
    user_id: number;
    service_id: number;
    message: string | null;
    files: string | null;
    transaction_id: string | null;
    amount: string | null;
    payer_name: string | null;
    payer_email: string | null;
    payment_method: string | null;
    status: string;
    admin_is_read: number;
    user_is_read: number;
    created_at?: Date;
    updated_at?: Date;
}
interface RevisionCreationAttributes extends Optional<RevisionAttributes, 'id' | 'message' | 'files' | 'transaction_id' | 'amount' | 'payer_name' | 'payer_email' | 'payment_method' | 'admin_is_read' | 'user_is_read' | 'created_at' | 'updated_at'> {
}
declare class Revision extends Model<RevisionAttributes, RevisionCreationAttributes> implements RevisionAttributes {
    id: number;
    order_id: number;
    user_id: number;
    service_id: number;
    message: string | null;
    files: string | null;
    transaction_id: string | null;
    amount: string | null;
    payer_name: string | null;
    payer_email: string | null;
    payment_method: string | null;
    status: string;
    admin_is_read: number;
    user_is_read: number;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default Revision;
//# sourceMappingURL=Revision.d.ts.map