import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { Favourite, Service, Category, Label } from '../models';
import { sendWelcomeEmail, sendPasswordResetEmail, sendEmailVerificationRequest } from '../services/EmailService';

export class AuthController {
  // Register user
  static async register(req: Request, res: Response) {
    try {
      const { first_name, last_name, email, phone_number, password } = req.body;
      
      // Validate required fields
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ message: 'First name, last name, email, and password are required' });
      }

      // Check if user already exists by email
      const existingUserByEmail = await User.findOne({ where: { email } });
      if (existingUserByEmail && existingUserByEmail.role !== 'guest') {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Check if user already exists by phone number (if phone_number is provided)
      if (phone_number) {
        const existingUserByPhone = await User.findOne({ where: { phone_number } });
        if (existingUserByPhone && existingUserByPhone.role !== 'guest') {
          return res.status(400).json({ message: 'User with this phone number already exists' });
        }
      }

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Create user (password will be hashed automatically by model hooks)
      let user;
      if(existingUserByEmail?.role !== 'guest') {
        user = await User.create({
          first_name,
          last_name,
          email,
          password,
          phone_number,
          role: 'user',
          is_active: 0,
          email_verification_token: emailVerificationToken,
        });
      } else {
        await User.update({
          first_name,
          last_name,
          email,
          password: await bcrypt.hash(password, 10),
          phone_number,
          role: 'user',
          is_active: 0,
          email_verification_token: emailVerificationToken,
        }, {
          where: { id: existingUserByEmail.id }
        });
        user = existingUserByEmail;
      }

      // Generate JWT token
      const secret = process.env['JWT_SECRET'] || 'fallback-secret';
      const token = jwt.sign(
        { id: user.id },
        secret,
        { expiresIn: '7d' }
      );

      // Send email verification email
      try {
        const verificationUrl = `http://${process.env['FRONTEND_URL']}/verify-email/${user.id}/${emailVerificationToken}`;
        console.log(verificationUrl);
        sendEmailVerificationRequest({
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          verificationUrl: verificationUrl
        });
      } catch (emailError) {
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
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle Sequelize unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        const errorMessages = error.errors?.map((err: any) => err.message) || [];
        
        if (errorMessages.some((msg: string) => msg.includes('email'))) {
          return res.status(400).json({ message: 'User with this email already exists' });
        }
        
        if (errorMessages.some((msg: string) => msg.includes('phone_number'))) {
          return res.status(400).json({ message: 'User with this phone number already exists' });
        }
        
        return res.status(400).json({ message: 'User already exists with provided information' });
      }
      
      // Handle other validation errors
      if (error.name === 'SequelizeValidationError') {
        const errorMessages = error.errors?.map((err: any) => err.message) || [];
        return res.status(400).json({ message: errorMessages.join(', ') });
      }
      
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Login user
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Check if user exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ error: 'Incorrect email address or password' });
      }

      // Check if user is active
      if (user.is_active !== 1) {
        return res.status(400).json({ error: 'Account is not active. Please verify your email first.' });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Incorrect email address or password' });
      }

      // Generate JWT token
      const secret = 'fallback-secret';
      const token = jwt.sign(
        { id: user.id },
        secret,
        { expiresIn: '7d' }
      );

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
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Verify email
  static async verifyEmail(req: Request, res: Response) {
    try {
      const { userId, token } = req.params;

      // Find user by ID and token
      const user = await User.findOne({
        where: {
          id: userId,
          email_verification_token: token,
        },
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid verification link or token has expired' });
      }

      // Check if email is already verified
      if (user.email_verified_at) {
        return res.status(200).json({
          success: true,
          message: 'Email verified successfully! You can now log in to your account.',
        });
      }

      // Update user to verified
      await user.update({
        email_verified_at: new Date(),
        is_active: 1,
      });

      // Send welcome email
      try {
        await sendWelcomeEmail({
          name: `${user.first_name} ${user.last_name}`,
          email: user.email
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully! You can now log in to your account.',
      });
    } catch (error) {
      console.error('Email verification error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Resend verification email
  static async resendVerificationEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Find user by email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if email is already verified
      if (user.email_verified_at) {
        return res.status(400).json({ message: 'Email is already verified' });
      }

      // Generate new verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      user.email_verification_token = emailVerificationToken;
      await user.save();

      // Send new verification email
      try {
        const verificationUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/api/auth/verify-email/${user.id}/${emailVerificationToken}`;
        await sendEmailVerificationRequest({
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          verificationUrl: verificationUrl
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        return res.status(500).json({ message: 'Failed to send verification email' });
      }

      return res.status(200).json({
        success: true,
        message: 'Verification email sent successfully. Please check your email.',
      });
    } catch (error) {
      console.error('Resend verification email error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Forgot password
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Send reset email
      try {
        await sendPasswordResetEmail({ name: user.first_name + ' ' + user.last_name, email: user.email }, resetToken);
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError);
        return res.status(500).json({ message: 'Failed to send reset email' });
      }

      return res.json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Reset password
  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, token } = req.params;
      const { password } = req.body;

      if (!email || !token || !password) {
        return res.status(400).json({ message: 'Email, token, and password are required' });
      }

      // Note: Token verification would need a PasswordResetToken model
      // For now, we'll just update the user password directly
      // In a real implementation, you'd verify the token first
      
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user password
      user.password = password;
      await user.save();

      return res.json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get current user
  static async getCurrentUser(req: any, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const user = await User.findByPk(req.user.id, {
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
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get user favourites
  static async getFavourites(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 15;
      const offset = (page - 1) * perPage;

      const { count, rows: favourites } = await Favourite.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: Service,
            as: 'service',
            include: [
              {
                model: Category,
                as: 'category',
              },
              {
                model: Label,
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

      // Transform favourites to match the desired format
      const transformedData = favourites.map((favourite: any) => ({
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

      // Build pagination links
      const links = [];
      
      // Previous link
      links.push({
        url: page > 1 ? `${baseUrl}?page=${page - 1}` : null,
        label: "&laquo; Previous",
        active: false
      });

      // Page numbers
      for (let i = 1; i <= totalPages; i++) {
        links.push({
          url: `${baseUrl}?page=${i}`,
          label: i.toString(),
          active: i === page
        });
      }

      // Next link
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
    } catch (error) {
      console.error('Get favourites error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Add service to favourites
  static async addFavourite(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const { service_id } = req.body;

      if (!service_id) {
        return res.status(400).json({ message: 'Service ID is required' });
      }

      // Check if service exists
      const service = await Service.findByPk(service_id, {
        include: [
          {
            model: Category,
            as: 'category',
          },
          {
            model: Label,
            as: 'label',
          },
        ],
      });
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      // Check if already favourited
      const existingFavourite = await Favourite.findOne({
        where: { user_id: userId, service_id },
      });

      if (existingFavourite) {
        return res.status(400).json({ message: 'Service already in favourites' });
      }

      const favourite = await Favourite.create({
        user_id: userId,
        service_id,
      });

      // Return the service data with favourite information
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
    } catch (error) {
      console.error('Add favourite error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Remove service from favourites
  static async removeFavourite(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const { service_id } = req.params;
      console.log(req.params);

      const favourite = await Favourite.findOne({
        where: { user_id: userId, service_id },
      });

      if (!favourite) {
        return res.status(404).json({ message: 'Favourite not found' });
      }

      await favourite.destroy();
      return res.json({ success: true, message: 'Service removed from favourites' });
    } catch (error) {
      console.error('Remove favourite error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Check if service is favourited
  static async checkFavourite(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const { service_id } = req.params;

      const favourite = await Favourite.findOne({
        where: { user_id: userId, service_id },
      });

      return res.json({
        success: true,
        data: { isFavourited: !!favourite },
      });
    } catch (error) {
      console.error('Check favourite error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get user's favourite count
  static async getFavouriteCount(req: any, res: Response) {
    try {
      const userId = req.user.id;

      const count = await Favourite.count({
        where: { user_id: userId },
      });

      return res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      console.error('Get favourite count error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Admin login
  static async adminLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Check if user exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ error: 'Incorrect email address or password' });
      }

      // Check if user is admin
      if (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'engineer' && user.role !== 'ENGINEER') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      // Check if user is active
      if (user.is_active !== 1) {
        return res.status(400).json({ error: 'Account is not active' });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Incorrect email address or password' });
      }

      // Generate JWT token with admin prefix
      const secret = 'fallback-secret';
      const token = `${user.id}|${jwt.sign(
        { id: user.id, role: user.role },
        secret,
        { expiresIn: '7d' }
      )}`;

      // Define admin permissions
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
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
} 