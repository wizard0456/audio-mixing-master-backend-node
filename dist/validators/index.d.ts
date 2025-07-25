import Joi from 'joi';
export declare const userValidation: {
    register: Joi.ObjectSchema<any>;
    login: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
    forgotPassword: Joi.ObjectSchema<any>;
    resetPassword: Joi.ObjectSchema<any>;
};
export declare const serviceValidation: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const categoryValidation: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const orderValidation: {
    create: Joi.ObjectSchema<any>;
    updateStatus: Joi.ObjectSchema<any>;
};
export declare const cartValidation: {
    addItem: Joi.ObjectSchema<any>;
    updateItem: Joi.ObjectSchema<any>;
};
export declare const paymentValidation: {
    createPayPal: Joi.ObjectSchema<any>;
    createStripe: Joi.ObjectSchema<any>;
};
export declare const fileValidation: {
    upload: Joi.ObjectSchema<any>;
};
export declare const paginationValidation: {
    query: Joi.ObjectSchema<any>;
};
export declare const searchValidation: {
    query: Joi.ObjectSchema<any>;
};
export declare const contactLeadValidation: {
    create: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=index.d.ts.map