import { Model, Optional } from 'sequelize';
interface UploadLeadGenerationAttributes {
    id: number;
    name: string;
    email: string;
    arlist_name: string;
    tarck_title: string;
    image: string;
    services: string;
    reference: string;
    file_type: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UploadLeadGenerationCreationAttributes extends Optional<UploadLeadGenerationAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class UploadLeadGeneration extends Model<UploadLeadGenerationAttributes, UploadLeadGenerationCreationAttributes> implements UploadLeadGenerationAttributes {
    id: number;
    name: string;
    email: string;
    arlist_name: string;
    tarck_title: string;
    image: string;
    services: string;
    reference: string;
    file_type: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default UploadLeadGeneration;
//# sourceMappingURL=UploadLeadGeneration.d.ts.map