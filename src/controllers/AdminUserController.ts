import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

export class AdminUserController {
  // Get all users
  static async index(req: Request, res: Response) {
    try {
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const page = parseInt(req.query['page'] as string) || 1;
      const isActive = req.query['is_active'] as string;
      const currentUserId = (req as AuthRequest).user?.id;

      // Build where conditions
      const whereConditions: any = {
        id: { [Op.ne]: currentUserId },
        role: { [Op.notIn]: ['admin', 'engineer'] }
      };

      // Add is_active filter
      if (isActive === 'active') {
        whereConditions.is_active = 1;
      } else if (isActive === 'inactive') {
        whereConditions.is_active = 0;
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereConditions,
        attributes: { exclude: ['password'] },
        order: [['id', 'DESC']],
        limit: perPage,
        offset: (page - 1) * perPage,
      });

      const lastPage = Math.ceil(count / perPage);

      // Generate pagination URLs
      const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
      const firstPageUrl = `${baseUrl}?page=1`;
      const lastPageUrl = `${baseUrl}?page=${lastPage}`;
      const nextPageUrl = page < lastPage ? `${baseUrl}?page=${page + 1}` : null;
      const prevPageUrl = page > 1 ? `${baseUrl}?page=${page - 1}` : null;

      // Generate pagination links
      const links = [];
      
      // Previous link
      links.push({
        url: prevPageUrl,
        label: "&laquo; Previous",
        active: false
      });

      // Page number links
      for (let i = 1; i <= lastPage; i++) {
        links.push({
          url: i === 1 ? baseUrl : `${baseUrl}?page=${i}`,
          label: i.toString(),
          active: i === page
        });
      }

      // Next link
      links.push({
        url: nextPageUrl,
        label: "Next &raquo;",
        active: false
      });

      // Transform user data to match the exact format
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
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Create new user
  static async store(req: AuthRequest, res: Response) {
    try {
      const { first_name, last_name, email, phone_number, password, confirm_password } = req.body;

      // Validation
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

      // Check if user already exists
      const existingUser = await User.findOne({ 
        where: { 
          [Op.or]: [{ email }, { phone_number }] 
        } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email or phone number already exists.' });
      }

      const user = await User.create({
        first_name,
        last_name,
        email,
        password,
        phone_number,
        role: 'user',
        is_active: 1,
      });

      // Remove password from response
      const userResponse = user.toJSON();
      delete (userResponse as any).password;

      return res.json(userResponse);
    } catch (error: any) {
      console.error('Create user error:', error);
      
      // Handle Sequelize unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        const errorMessages = error.errors?.map((err: any) => err.message) || [];
        
        if (errorMessages.some((msg: string) => msg.includes('email'))) {
          return res.status(400).json({ error: 'User with this email already exists' });
        }
        
        if (errorMessages.some((msg: string) => msg.includes('phone_number'))) {
          return res.status(400).json({ error: 'User with this phone number already exists' });
        }
        
        return res.status(400).json({ error: 'User already exists with provided information' });
      }
      
      // Handle other validation errors
      if (error.name === 'SequelizeValidationError') {
        const errorMessages = error.errors?.map((err: any) => err.message) || [];
        return res.status(400).json({ error: errorMessages.join(', ') });
      }
      
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Get user by ID
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findOne({
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
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Update user
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { first_name, last_name, email, phone_number, password, confirm_password } = req.query;

      // Convert query parameters to strings
      const firstName = first_name as string;
      const lastName = last_name as string;
      const emailStr = email as string;
      const phoneNumber = phone_number as string;
      const passwordStr = password as string;
      const confirmPassword = confirm_password as string;

      // Validation
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

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Check if email or phone already exists for other users
      const existingUser = await User.findOne({ 
        where: { 
          [Op.and]: [
            { [Op.or]: [{ email: emailStr }, { phone_number: phoneNumber }] },
            { id: { [Op.ne]: id } }
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

      // Remove password from response
      const userResponse = user.toJSON();
      delete (userResponse as any).password;

      return res.json(userResponse);
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Delete user
  static async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'No data found' });
      }

      await user.destroy();

      return res.json('Deleted');
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Update user status
  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      // Validation
      if (status === undefined || status === null) {
        return res.status(400).json({ error: 'Status required.' });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'No data found' });
      }

      await user.update({ is_active: parseInt(status as string) });

      // Remove password from response
      const userResponse = user.toJSON();
      delete (userResponse as any).password;

      return res.json(userResponse);
    } catch (error) {
      console.error('Update user status error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Create engineer
  static async storeEngineer(req: AuthRequest, res: Response) {
    try {
      const { first_name, last_name, email, phone_number, password, confirm_password } = req.body;

      // Validation
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

      // Check if user already exists
      const existingUser = await User.findOne({ 
        where: { 
          [Op.or]: [{ email }, { phone_number }] 
        } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email or phone number already exists.' });
      }

      const engineer = await User.create({
        first_name,
        last_name,
        email,
        password,
        phone_number,
        role: 'engineer',
        email_verified_at: new Date(),
        is_active: 1,
      });

      // Remove password from response
      const engineerResponse = engineer.toJSON();
      delete (engineerResponse as any).password;

      return res.json(engineerResponse);
    } catch (error: any) {
      console.error('Create engineer error:', error);
      
      // Handle Sequelize unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        const errorMessages = error.errors?.map((err: any) => err.message) || [];
        
        if (errorMessages.some((msg: string) => msg.includes('email'))) {
          return res.status(400).json({ error: 'Engineer with this email already exists' });
        }
        
        if (errorMessages.some((msg: string) => msg.includes('phone_number'))) {
          return res.status(400).json({ error: 'Engineer with this phone number already exists' });
        }
        
        return res.status(400).json({ error: 'Engineer already exists with provided information' });
      }
      
      // Handle other validation errors
      if (error.name === 'SequelizeValidationError') {
        const errorMessages = error.errors?.map((err: any) => err.message) || [];
        return res.status(400).json({ error: errorMessages.join(', ') });
      }
      
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // List engineers
  static async listEngineer(req: Request, res: Response) {
    try {
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const page = parseInt(req.query['page'] as string) || 1;
      const isActive = req.query['is_active'] as string;
      const currentUserId = (req as AuthRequest).user?.id;

      // Build where conditions
      const whereConditions: any = {
        id: { [Op.ne]: currentUserId },
        role: { [Op.notIn]: ['user', 'admin'] }
      };

      // Add is_active filter
      if (isActive === 'active') {
        whereConditions.is_active = 1;
      } else if (isActive === 'inactive') {
        whereConditions.is_active = 0;
      }

      const { count, rows: engineers } = await User.findAndCountAll({
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
    } catch (error) {
      console.error('Get engineers error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Show engineer by ID
  static async showEngineer(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const engineer = await User.findOne({
        where: { id, role: 'engineer' },
        attributes: { exclude: ['password'] },
      });

      if (!engineer) {
        return res.status(404).json({ error: 'No data found' });
      }

      return res.json(engineer);
    } catch (error) {
      console.error('Get engineer error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
} 