import { Model, Optional } from 'sequelize';
import User from './User';
interface TestimonialAttributes {
    id: number;
    user_id?: number;
    user_name: string;
    text: string;
    img_url: string;
    site_url: string;
    ratings: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface TestimonialCreationAttributes extends Optional<TestimonialAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Testimonial extends Model<TestimonialAttributes, TestimonialCreationAttributes> implements TestimonialAttributes {
    id: number;
    user_id?: number;
    user_name: string;
    text: string;
    img_url: string;
    site_url: string;
    ratings: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly user?: User;
}
export default Testimonial;
//# sourceMappingURL=Testimonial.d.ts.map