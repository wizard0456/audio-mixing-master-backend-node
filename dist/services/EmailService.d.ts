export declare const getEmailServiceStatus: () => {
    available: boolean;
    configured: boolean;
    smtpHost: string;
    smtpUser: string;
    smtpPort: string;
};
export declare const initializeEmailService: () => Promise<void>;
export declare const sendEmail: (options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
}) => Promise<any>;
export declare const sendWelcomeEmail: (user: {
    name: string;
    email: string;
}) => Promise<any>;
export declare const sendPasswordResetEmail: (user: {
    name: string;
    email: string;
}, resetToken: string) => Promise<any>;
export declare const sendOrderConfirmationEmail: (user: {
    name: string;
    email: string;
}, order: any) => Promise<any>;
export declare const sendOrderCompletedEmail: (user: {
    name: string;
    email: string;
}, order: any) => Promise<any>;
export declare const sendOrderSuccessEmail: (data: {
    name: string;
    order_id: number;
    message: string;
    items: any[];
    url: string;
    email?: string;
}) => Promise<any>;
export declare const sendOrderStatusEmail: (data: {
    name: string;
    order_id: number;
    status: string;
    message: string;
    url: string;
    email?: string;
}) => Promise<any>;
export declare const sendGiftCardEmail: (data: {
    name: string;
    message: string;
    code: string;
    email?: string;
}) => Promise<any>;
export declare const sendRevisionSuccessEmail: (data: {
    name: string;
    order_id: number;
    service_id: number;
    amount: number;
    message: string;
    url: string;
    email?: string;
}) => Promise<any>;
export declare const sendSubscriptionDiscountEmail: (data: {
    name: string;
    email: string;
    couponCode: string;
}) => Promise<any>;
export declare const sendOrderStatusUpdateEmail: (data: {
    name: string;
    email: string;
    order_id: number;
    status: string;
    url: string;
}) => Promise<any>;
export declare const sendOrderDeliveredEmail: (data: {
    name: string;
    email: string;
    order_id: number;
    url: string;
}) => Promise<any>;
export declare const sendRevisionProgressEmail: (data: {
    name: string;
    email: string;
    order_id: number;
}) => Promise<any>;
export declare const sendPasswordResetEmailUpdated: (data: {
    name: string;
    email: string;
    resetUrl: string;
}) => Promise<any>;
export declare const sendEmailVerificationRequest: (data: {
    name: string;
    email: string;
    verificationUrl: string;
}) => Promise<any>;
export declare const sendEmailVerificationSuccess: (data: {
    name: string;
    email: string;
}) => Promise<any>;
export declare const sendCartReminderEmail: (data: {
    name: string;
    email: string;
}) => Promise<any>;
//# sourceMappingURL=EmailService.d.ts.map