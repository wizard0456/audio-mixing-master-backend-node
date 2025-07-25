"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const models_1 = require("../models");
const EmailService_1 = require("../services/EmailService");
class AuthController {
    static async register(req, res) {
        try {
            const { first_name, last_name, email, phone_number, password } = req.body;
            if (!first_name || !last_name || !email || !password) {
                return res.status(400).json({ message: 'First name, last name, email, and password are required' });
            }
            const existingUserByEmail = await User_1.default.findOne({ where: { email } });
            if (existingUserByEmail && existingUserByEmail.role !== 'guest') {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            if (phone_number) {
                const existingUserByPhone = await User_1.default.findOne({ where: { phone_number } });
                if (existingUserByPhone && existingUserByPhone.role !== 'guest') {
                    return res.status(400).json({ message: 'User with this phone number already exists' });
                }
            }
            const emailVerificationToken = crypto_1.default.randomBytes(32).toString('hex');
            let user;
            if (existingUserByEmail?.role !== 'guest') {
                user = await User_1.default.create({
                    first_name,
                    last_name,
                    email,
                    password,
                    phone_number,
                    role: 'user',
                    is_active: 0,
                    email_verification_token: emailVerificationToken,
                });
            }
            else {
                await User_1.default.update({
                    first_name,
                    last_name,
                    email,
                    password: await bcryptjs_1.default.hash(password, 10),
                    phone_number,
                    role: 'user',
                    is_active: 0,
                    email_verification_token: emailVerificationToken,
                }, {
                    where: { id: existingUserByEmail.id }
                });
                user = existingUserByEmail;
            }
            const secret = process.env['JWT_SECRET'] || 'fallback-secret';
            const token = jsonwebtoken_1.default.sign({ id: user.id }, secret, { expiresIn: '7d' });
            try {
                const verificationUrl = `http://${process.env['FRONTEND_URL']}/verify-email/${user.id}/${emailVerificationToken}`;
                console.log(verificationUrl);
                (0, EmailService_1.sendEmailVerificationRequest)({
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    verificationUrl: verificationUrl
                });
            }
            catch (emailError) {
                console.error('Failed to send verification email:', emailError);
            }
            return res.status(200).json({
                success: true,
                message: 'Please check your email to verify your account.',
                data: {
                    user: {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        is_active: user.is_active,
                        email_verified_at: user.email_verified_at,
                    },
                    token,
                },
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                const errorMessages = error.errors?.map((err) => err.message) || [];
                if (errorMessages.some((msg) => msg.includes('email'))) {
                    return res.status(400).json({ message: 'User with this email already exists' });
                }
                if (errorMessages.some((msg) => msg.includes('phone_number'))) {
                    return res.status(400).json({ message: 'User with this phone number already exists' });
                }
                return res.status(400).json({ message: 'User already exists with provided information' });
            }
            if (error.name === 'SequelizeValidationError') {
                const errorMessages = error.errors?.map((err) => err.message) || [];
                return res.status(400).json({ message: errorMessages.join(', ') });
            }
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }
            const user = await User_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ error: 'Incorrect email address or password' });
            }
            if (user.is_active !== 1) {
                return res.status(400).json({ error: 'Account is not active. Please verify your email first.' });
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Incorrect email address or password' });
            }
            const secret = 'fallback-secret';
            const token = jsonwebtoken_1.default.sign({ id: user.id }, secret, { expiresIn: '7d' });
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        role: user.role,
                        is_active: user.is_active,
                        email_verified_at: user.email_verified_at,
                    },
                    token,
                },
            });
        }
        catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async verifyEmail(req, res) {
        try {
            const { userId, token } = req.params;
            const user = await User_1.default.findOne({
                where: {
                    id: userId,
                    email_verification_token: token,
                },
            });
            if (!user) {
                return res.status(400).json({ message: 'Invalid verification link or token has expired' });
            }
            if (user.email_verified_at) {
                return res.status(200).json({
                    success: true,
                    message: 'Email verified successfully! You can now log in to your account.',
                });
            }
            await user.update({
                email_verified_at: new Date(),
                is_active: 1,
            });
            try {
                await (0, EmailService_1.sendWelcomeEmail)({
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email
                });
            }
            catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
            }
            return res.status(200).json({
                success: true,
                message: 'Email verified successfully! You can now log in to your account.',
            });
        }
        catch (error) {
            console.error('Email verification error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async resendVerificationEmail(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }
            const user = await User_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user.email_verified_at) {
                return res.status(400).json({ message: 'Email is already verified' });
            }
            const emailVerificationToken = crypto_1.default.randomBytes(32).toString('hex');
            user.email_verification_token = emailVerificationToken;
            await user.save();
            try {
                const verificationUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/api/auth/verify-email/${user.id}/${emailVerificationToken}`;
                await (0, EmailService_1.sendEmailVerificationRequest)({
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    verificationUrl: verificationUrl
                });
            }
            catch (emailError) {
                console.error('Failed to send verification email:', emailError);
                return res.status(500).json({ message: 'Failed to send verification email' });
            }
            return res.status(200).json({
                success: true,
                message: 'Verification email sent successfully. Please check your email.',
            });
        }
        catch (error) {
            console.error('Resend verification email error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }
            const user = await User_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const resetToken = crypto_1.default.randomBytes(32).toString('hex');
            try {
                await (0, EmailService_1.sendPasswordResetEmail)({ name: user.first_name + ' ' + user.last_name, email: user.email }, resetToken);
            }
            catch (emailError) {
                console.error('Failed to send reset email:', emailError);
                return res.status(500).json({ message: 'Failed to send reset email' });
            }
            return res.json({
                success: true,
                message: 'Password reset email sent',
            });
        }
        catch (error) {
            console.error('Forgot password error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { email, token } = req.params;
            const { password } = req.body;
            if (!email || !token || !password) {
                return res.status(400).json({ message: 'Email, token, and password are required' });
            }
            const user = await User_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            user.password = password;
            await user.save();
            return res.json({
                success: true,
                message: 'Password reset successful',
            });
        }
        catch (error) {
            console.error('Reset password error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getCurrentUser(req, res) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const user = await User_1.default.findByPk(req.user.id, {
                attributes: { exclude: ['password'] },
            });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.json({
                id: user.id,
                avatar: user.avatar || null,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                email_verified_at: user.email_verified_at,
                phone_number: user.phone_number,
                role: user.role,
                is_active: user.is_active,
                created_at: user.createdAt,
                updated_at: user.updatedAt
            });
        }
        catch (error) {
            console.error('Get current user error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getFavourites(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.per_page) || 15;
            const offset = (page - 1) * perPage;
            const { count, rows: favourites } = await models_1.Favourite.findAndCountAll({
                where: { user_id: userId },
                include: [
                    {
                        model: models_1.Service,
                        as: 'service',
                        include: [
                            {
                                model: models_1.Category,
                                as: 'category',
                            },
                            {
                                model: models_1.Label,
                                as: 'label',
                            },
                        ],
                    },
                ],
                order: [['createdAt', 'DESC']],
                limit: perPage,
                offset: offset,
            });
            const totalPages = Math.ceil(count / perPage);
            const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
            const transformedData = favourites.map((favourite) => ({
                id: favourite.service.id,
                user_id: favourite.user_id,
                service_id: favourite.service_id,
                created_at: favourite.createdAt,
                updated_at: favourite.updatedAt,
                category_id: favourite.service.category_id,
                label_id: favourite.service.label_id,
                parent_id: favourite.service.parent_id,
                paypal_product_id: favourite.service.paypal_product_id,
                paypal_plan_id: favourite.service.paypal_plan_id,
                stripe_product_id: favourite.service.stripe_product_id,
                stripe_plan_id: favourite.service.stripe_plan_id,
                name: favourite.service.name,
                image: favourite.service.image,
                is_url: favourite.service.is_url,
                price: favourite.service.price,
                discounted_price: favourite.service.discounted_price,
                service_type: favourite.service.service_type,
                detail: favourite.service.detail,
                brief_detail: favourite.service.brief_detail,
                includes: favourite.service.includes,
                description: favourite.service.description,
                requirements: favourite.service.requirements,
                notes: favourite.service.notes,
                tags: favourite.service.tags,
                is_active: favourite.service.is_active,
                is_variation: favourite.service.is_variation,
                detail_data: favourite.service.detail_data,
                is_session: favourite.service.is_session,
                label_name: favourite.service.label?.name || null
            }));
            const links = [];
            links.push({
                url: page > 1 ? `${baseUrl}?page=${page - 1}` : null,
                label: "&laquo; Previous",
                active: false
            });
            for (let i = 1; i <= totalPages; i++) {
                links.push({
                    url: `${baseUrl}?page=${i}`,
                    label: i.toString(),
                    active: i === page
                });
            }
            links.push({
                url: page < totalPages ? `${baseUrl}?page=${page + 1}` : null,
                label: "Next &raquo;",
                active: false
            });
            return res.json({
                current_page: page,
                data: transformedData,
                first_page_url: `${baseUrl}?page=1`,
                from: count > 0 ? offset + 1 : null,
                last_page: totalPages,
                last_page_url: `${baseUrl}?page=${totalPages}`,
                links: links,
                next_page_url: page < totalPages ? `${baseUrl}?page=${page + 1}` : null,
                path: baseUrl,
                per_page: perPage,
                prev_page_url: page > 1 ? `${baseUrl}?page=${page - 1}` : null,
                to: count > 0 ? Math.min(offset + perPage, count) : null,
                total: count
            });
        }
        catch (error) {
            console.error('Get favourites error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async addFavourite(req, res) {
        try {
            const userId = req.user.id;
            const { service_id } = req.body;
            if (!service_id) {
                return res.status(400).json({ message: 'Service ID is required' });
            }
            const service = await models_1.Service.findByPk(service_id, {
                include: [
                    {
                        model: models_1.Category,
                        as: 'category',
                    },
                    {
                        model: models_1.Label,
                        as: 'label',
                    },
                ],
            });
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }
            const existingFavourite = await models_1.Favourite.findOne({
                where: { user_id: userId, service_id },
            });
            if (existingFavourite) {
                return res.status(400).json({ message: 'Service already in favourites' });
            }
            const favourite = await models_1.Favourite.create({
                user_id: userId,
                service_id,
            });
            return res.status(201).json({
                id: favourite.id,
                user_id: favourite.user_id,
                service_id: favourite.service_id,
                created_at: favourite.createdAt,
                updated_at: favourite.updatedAt,
                category_id: service.category_id,
                label_id: service.label_id,
                parent_id: service.parent_id,
                paypal_product_id: service.paypal_product_id,
                paypal_plan_id: service.paypal_plan_id,
                stripe_product_id: service.stripe_product_id,
                stripe_plan_id: service.stripe_plan_id,
                name: service.name,
                image: service.image,
                is_url: service.is_url,
                price: service.price,
                discounted_price: service.discounted_price,
                service_type: service.service_type,
                detail: service.detail,
                brief_detail: service.brief_detail,
                includes: service.includes,
                description: service.description,
                requirements: service.requirements,
                notes: service.notes,
                tags: service.tags,
                is_active: service.is_active,
                is_variation: service.is_variation,
                detail_data: service.detail_data,
                is_session: service.is_session,
                label_name: service.label?.name || null
            });
        }
        catch (error) {
            console.error('Add favourite error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async removeFavourite(req, res) {
        try {
            const userId = req.user.id;
            const { service_id } = req.params;
            console.log(req.params);
            const favourite = await models_1.Favourite.findOne({
                where: { user_id: userId, service_id },
            });
            if (!favourite) {
                return res.status(404).json({ message: 'Favourite not found' });
            }
            await favourite.destroy();
            return res.json({ success: true, message: 'Service removed from favourites' });
        }
        catch (error) {
            console.error('Remove favourite error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async checkFavourite(req, res) {
        try {
            const userId = req.user.id;
            const { service_id } = req.params;
            const favourite = await models_1.Favourite.findOne({
                where: { user_id: userId, service_id },
            });
            return res.json({
                success: true,
                data: { isFavourited: !!favourite },
            });
        }
        catch (error) {
            console.error('Check favourite error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getFavouriteCount(req, res) {
        try {
            const userId = req.user.id;
            const count = await models_1.Favourite.count({
                where: { user_id: userId },
            });
            return res.json({
                success: true,
                data: { count },
            });
        }
        catch (error) {
            console.error('Get favourite count error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async adminLogin(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }
            const user = await User_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ error: 'Incorrect email address or password' });
            }
            if (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'engineer' && user.role !== 'ENGINEER') {
                return res.status(403).json({ error: 'Access denied. Admin only.' });
            }
            if (user.is_active !== 1) {
                return res.status(400).json({ error: 'Account is not active' });
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Incorrect email address or password' });
            }
            const secret = 'fallback-secret';
            const token = `${user.id}|${jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, secret, { expiresIn: '7d' })}`;
            const permissions = [
                "orders",
                "admins",
                "users",
                "assign_orders",
                "order_status_change"
            ];
            return res.json({
                token,
                id: user.id,
                role: user.role.toLowerCase(),
                permissions
            });
        }
        catch (error) {
            console.error('Admin login error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map