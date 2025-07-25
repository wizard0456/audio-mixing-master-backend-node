import { Request, Response } from 'express';
import Category from '../models/Category';
import { AuthRequest } from '../middleware/auth';
import sequelize from '../config/database';

export class AdminCategoryController {
  // Get all categories
  static async index(req: Request, res: Response) {
    try {
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const page = parseInt(req.query['page'] as string) || 1;
      const isActive = req.query['is_active'] as string;

      // Build where conditions
      const whereConditions: any = {};

      // Add is_active filter
      if (isActive === 'active') {
        whereConditions.is_active = 1;
      } else if (isActive === 'inactive') {
        whereConditions.is_active = 0;
      }

      const { count, rows: categories } = await Category.findAndCountAll({
        where: whereConditions,
        order: [['id', 'DESC']],
        limit: perPage,
        offset: (page - 1) * perPage,
      });

      const totalPages = Math.ceil(count / perPage);

      return res.json({
        data: categories,
        current_page: page,
        per_page: perPage,
        total: count,
        last_page: totalPages,
        from: (page - 1) * perPage + 1,
        to: Math.min(page * perPage, count),
      });
    } catch (error) {
      console.error('Get categories error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Create new category
  static async store(req: AuthRequest, res: Response) {
    const transaction = await sequelize.transaction();
    
    try {
      const { name } = req.body;

      // Validation
      if (!name || name.length > 255) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Name required and maximum 255 characters.' });
      }

      const category = await Category.create({
        name,
        is_active: 1,
      }, { transaction });

      await transaction.commit();
      return res.json(category);
    } catch (error) {
      await transaction.rollback();
      console.error('Create category error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Get category by ID
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({ error: 'No data found' });
      }

      return res.json(category);
    } catch (error) {
      console.error('Get category error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Update category
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, is_active } = req.query;

      // Convert query parameters to proper types
      const nameStr = name as string;
      const isActive = parseInt(is_active as string);

      // Validation
      if (!nameStr || nameStr.length > 255) {
        return res.status(400).json({ error: 'Name required and maximum 255 characters.' });
      }

      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({ error: 'No data found' });
      }

      await category.update({
        name: nameStr,
        is_active: isActive,
      });

      return res.json(category);
    } catch (error) {
      console.error('Update category error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Delete category
  static async destroy(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);

      if (!category) {
        await transaction.rollback();
        return res.status(404).json({ error: 'No data found' });
      }

      await category.destroy({ transaction });

      await transaction.commit();
      return res.json('Deleted');
    } catch (error) {
      await transaction.rollback();
      console.error('Delete category error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Update category status
  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      // Validation
      if (status === undefined || status === null) {
        return res.status(400).json({ error: 'Status required.' });
      }

      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({ error: 'No data found' });
      }

      await category.update({ is_active: parseInt(status as string) });

      return res.json(category);
    } catch (error) {
      console.error('Update category status error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
} 