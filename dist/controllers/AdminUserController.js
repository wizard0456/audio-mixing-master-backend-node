"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserController = void 0;
const User_1 = __importDefault(require("../models/User"));
const sequelize_1 = require("sequelize");
class AdminUserController {
    static async index(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 10;
            const page = parseInt(req.query['page']) || 1;
            const isActive = req.query['is_active'];
            const currentUserId = req.user?.id;
            const whereConditions = {
                id: { [sequelize_1.Op.ne]: currentUserId },
                role: { [sequelize_1.Op.notIn]: ['admin', 'engineer'] }
            };
            if (isActive === 'active') {
                whereConditions.is_active = 1;
            }
            else if (isActive === 'inactive') {
                whereConditions.is_active = 0;
            }
            const { count, rows: users } = await User_1.default.findAndCountAll({
                where: whereConditions,
                attributes: { exclude: ['password'] },
                order: [['id', 'DESC']],
                limit: perPage,
                offset: (page - 1) * perPage,
            });
            const lastPage = Math.ceil(count / perPage);
            const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
            const firstPageUrl = `${baseUrl}?page=1`;
            const lastPageUrl = `${baseUrl}?page=${lastPage}`;
            const nextPageUrl = page < lastPage ? `${baseUrl}?page=${page + 1}` : null;
            const prevPageUrl = page > 1 ? `${baseUrl}?page=${page - 1}` : null;
            const links = [];
            links.push({
                url: prevPageUrl,
                label: "&laquo; Previous",
                active: false
            });
            for (let i = 1; i <= lastPage; i++) {
                links.push({
                    url: i === 1 ? baseUrl : `${baseUrl}?page=${i}`,
                    label: i.toString(),
                    active: i === page
                });
            }
            links.push({
                url: nextPageUrl,
                label: "Next &raquo;",
                active: false
            });
            const transformedUsers = users.map(user => ({
                id: user.id,
                avatar: user.avatar,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                email_verified_at: user.email_verified_at,
                phone_number: user.phone_number,
                role: user.role,
                is_active: user.is_active,
                created_at: user.createdAt,
                updated_at: user.updatedAt
            }));
            return res.json({
                current_page: page,
                data: transformedUsers,
                first_page_url: firstPageUrl,
                from: ((page - 1) * perPage) + 1,
                last_page: lastPage,
                last_page_url: lastPageUrl,
                links: links,
                next_page_url: nextPageUrl,
                path: baseUrl,
                per_page: perPage,
                prev_page_url: prevPageUrl,
                to: Math.min(page * perPage, count),
                total: count,
            });
        }
        catch (error) {
            console.error('Get users error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async store(req, res) {
        try {
            const { first_name, last_name, email, phone_number, password, confirm_password } = req.body;
            if (!first_name || first_name.length > 255) {
                return res.status(400).json({ error: 'First name required and must be less than 255 characters.' });
            }
            if (!last_name || last_name.length > 255) {
                return res.status(400).json({ error: 'Last name required and must be less than 255 characters.' });
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
                return res.status(400).json({ error: 'Invalid email or email must be less than 255 characters.' });
            }
            if (!phone_number || !/^\d+$/.test(phone_number)) {
                return res.status(400).json({ error: 'Invalid phone number.' });
            }
            if (!password || password.length < 8 || password.length > 20) {
                return res.status(400).json({ error: 'Password must be at least 8 characters and less than 20 characters.' });
            }
            if (!confirm_password || confirm_password !== password) {
                return res.status(400).json({ error: 'Confirm password must be same as password.' });
            }
            const existingUser = await User_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [{ email }, { phone_number }]
                }
            });
            if (existingUser) {
                return res.status(400).json({ error: 'Email or phone number already exists.' });
            }
            const user = await User_1.default.create({
                first_name,
                last_name,
                email,
                password,
                phone_number,
                role: 'user',
                is_active: 1,
            });
            const userResponse = user.toJSON();
            delete userResponse.password;
            return res.json(userResponse);
        }
        catch (error) {
            console.error('Create user error:', error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                const errorMessages = error.errors?.map((err) => err.message) || [];
                if (errorMessages.some((msg) => msg.includes('email'))) {
                    return res.status(400).json({ error: 'User with this email already exists' });
                }
                if (errorMessages.some((msg) => msg.includes('phone_number'))) {
                    return res.status(400).json({ error: 'User with this phone number already exists' });
                }
                return res.status(400).json({ error: 'User already exists with provided information' });
            }
            if (error.name === 'SequelizeValidationError') {
                const errorMessages = error.errors?.map((err) => err.message) || [];
                return res.status(400).json({ error: errorMessages.join(', ') });
            }
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const user = await User_1.default.findOne({
                where: {
                    id,
                    role: 'user'
                },
                attributes: { exclude: ['password'] },
            });
            if (!user) {
                return res.status(404).json({ error: 'No data found' });
            }
            return res.json(user);
        }
        catch (error) {
            console.error('Get user error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { first_name, last_name, email, phone_number, password, confirm_password } = req.query;
            const firstName = first_name;
            const lastName = last_name;
            const emailStr = email;
            const phoneNumber = phone_number;
            const passwordStr = password;
            const confirmPassword = confirm_password;
            if (!firstName || firstName.length > 255) {
                return res.status(400).json({ error: 'First name required and must be less than 255 characters.' });
            }
            if (!lastName || lastName.length > 255) {
                return res.status(400).json({ error: 'Last name required and must be less than 255 characters.' });
            }
            if (!emailStr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr) || emailStr.length > 255) {
                return res.status(400).json({ error: 'Invalid email or email must be less than 255 characters.' });
            }
            if (!phoneNumber || !/^\d+$/.test(phoneNumber)) {
                return res.status(400).json({ error: 'Invalid phone number.' });
            }
            if (passwordStr && (passwordStr.length < 8 || passwordStr.length > 20)) {
                return res.status(400).json({ error: 'Password must be at least 8 characters and less than 20 characters.' });
            }
            if (passwordStr && (!confirmPassword || confirmPassword !== passwordStr)) {
                return res.status(400).json({ error: 'Confirm password must be same as password.' });
            }
            const user = await User_1.default.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'No data found' });
            }
            const existingUser = await User_1.default.findOne({
                where: {
                    [sequelize_1.Op.and]: [
                        { [sequelize_1.Op.or]: [{ email: emailStr }, { phone_number: phoneNumber }] },
                        { id: { [sequelize_1.Op.ne]: id } }
                    ]
                }
            });
            if (existingUser) {
                return res.status(400).json({ error: 'Email or phone number already exists.' });
            }
            await user.update({
                first_name: firstName,
                last_name: lastName,
                email: emailStr,
                phone_number: phoneNumber,
                ...(passwordStr && { password: passwordStr }),
                role: 'user',
            });
            const userResponse = user.toJSON();
            delete userResponse.password;
            return res.json(userResponse);
        }
        catch (error) {
            console.error('Update user error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            const user = await User_1.default.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'No data found' });
            }
            await user.destroy();
            return res.json('Deleted');
        }
        catch (error) {
            console.error('Delete user error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.query;
            if (status === undefined || status === null) {
                return res.status(400).json({ error: 'Status required.' });
            }
            const user = await User_1.default.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'No data found' });
            }
            await user.update({ is_active: parseInt(status) });
            const userResponse = user.toJSON();
            delete userResponse.password;
            return res.json(userResponse);
        }
        catch (error) {
            console.error('Update user status error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async storeEngineer(req, res) {
        try {
            const { first_name, last_name, email, phone_number, password, confirm_password } = req.body;
            if (!first_name || first_name.length > 255) {
                return res.status(400).json({ error: 'First name required and must be less than 255 characters.' });
            }
            if (!last_name || last_name.length > 255) {
                return res.status(400).json({ error: 'Last name required and must be less than 255 characters.' });
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
                return res.status(400).json({ error: 'Invalid email or email must be less than 255 characters.' });
            }
            if (!phone_number || !/^\d+$/.test(phone_number)) {
                return res.status(400).json({ error: 'Invalid phone number.' });
            }
            if (!password || password.length < 8 || password.length > 20) {
                return res.status(400).json({ error: 'Password must be at least 8 characters and less than 20 characters.' });
            }
            if (!confirm_password || confirm_password !== password) {
                return res.status(400).json({ error: 'Confirm password must be same as password.' });
            }
            const existingUser = await User_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [{ email }, { phone_number }]
                }
            });
            if (existingUser) {
                return res.status(400).json({ error: 'Email or phone number already exists.' });
            }
            const engineer = await User_1.default.create({
                first_name,
                last_name,
                email,
                password,
                phone_number,
                role: 'engineer',
                email_verified_at: new Date(),
                is_active: 1,
            });
            const engineerResponse = engineer.toJSON();
            delete engineerResponse.password;
            return res.json(engineerResponse);
        }
        catch (error) {
            console.error('Create engineer error:', error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                const errorMessages = error.errors?.map((err) => err.message) || [];
                if (errorMessages.some((msg) => msg.includes('email'))) {
                    return res.status(400).json({ error: 'Engineer with this email already exists' });
                }
                if (errorMessages.some((msg) => msg.includes('phone_number'))) {
                    return res.status(400).json({ error: 'Engineer with this phone number already exists' });
                }
                return res.status(400).json({ error: 'Engineer already exists with provided information' });
            }
            if (error.name === 'SequelizeValidationError') {
                const errorMessages = error.errors?.map((err) => err.message) || [];
                return res.status(400).json({ error: errorMessages.join(', ') });
            }
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async listEngineer(req, res) {
        try {
            const perPage = parseInt(req.query['per_page']) || 10;
            const page = parseInt(req.query['page']) || 1;
            const isActive = req.query['is_active'];
            const currentUserId = req.user?.id;
            const whereConditions = {
                id: { [sequelize_1.Op.ne]: currentUserId },
                role: { [sequelize_1.Op.notIn]: ['user', 'admin'] }
            };
            if (isActive === 'active') {
                whereConditions.is_active = 1;
            }
            else if (isActive === 'inactive') {
                whereConditions.is_active = 0;
            }
            const { count, rows: engineers } = await User_1.default.findAndCountAll({
                where: whereConditions,
                attributes: { exclude: ['password'] },
                order: [['id', 'DESC']],
                limit: perPage,
                offset: (page - 1) * perPage,
            });
            const totalPages = Math.ceil(count / perPage);
            return res.json({
                data: engineers,
                current_page: page,
                per_page: perPage,
                total: count,
                last_page: totalPages,
                from: (page - 1) * perPage + 1,
                to: Math.min(page * perPage, count),
            });
        }
        catch (error) {
            console.error('Get engineers error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    static async showEngineer(req, res) {
        try {
            const { id } = req.params;
            const engineer = await User_1.default.findOne({
                where: { id, role: 'engineer' },
                attributes: { exclude: ['password'] },
            });
            if (!engineer) {
                return res.status(404).json({ error: 'No data found' });
            }
            return res.json(engineer);
        }
        catch (error) {
            console.error('Get engineer error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
exports.AdminUserController = AdminUserController;
//# sourceMappingURL=AdminUserController.js.map