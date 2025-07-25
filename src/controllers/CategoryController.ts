import { Request, Response } from 'express';
import { Category, Service, Label } from '../models';
import sequelize from '../config/database';

export class CategoryController {
  // Get all categories
  static async index(_req: Request, res: Response) {
    try {
      const categories = await Category.findAll({
        where: { is_active: 1 },
        include: [
          {
            model: Service,
            as: 'services',
            where: { is_active: 1 },
            required: false,
            attributes: [],
          },
        ],
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM services
                WHERE services.category_id = Category.id
                AND services.is_active = 1
              )`),
              'serviceCount',
            ],
          ],
        },
        order: [['created_at', 'DESC']],
      });
      return res.json({ success: true, data: { categories } });
    } catch (error) {
      console.error('Category index error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get category by ID
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await Category.findOne({
        where: { id, is_active: 1 },
        include: [
          {
            model: Service,
            as: 'services',
            where: { is_active: 1 },
            required: false,
          },
        ],
      });
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      return res.json({ success: true, data: { category } });
    } catch (error) {
      console.error('Category show error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get categories with services
  static async getWithServices(_req: Request, res: Response) {
    try {
      const categories = await Category.findAll({
        where: { is_active: 1 },
        attributes: ['id', 'name', 'is_active'],
        include: [
          {
            model: Service,
            as: 'services',
            where: { is_active: 1, parent_id: 0 },
            required: false,
            attributes: [
              'id',
              'category_id',
              'image',
              'name',
              'service_type',
              'price',
              'discounted_price',
              'label_id',
              'paypal_product_id',
              'stripe_plan_id',
              'paypal_plan_id',
            ],
            include: [
              {
                model: Label,
                as: 'label',
                required: false,
                attributes: ['id', 'name', 'is_active'],
                where: { is_active: 1 },
              },
            ],
          },
        ],
        order: [['id', 'ASC']],
      });
      if (!categories || categories.length === 0) {
        return res.status(200).json({ message: 'No data found.' });
      }
      return res.json(categories);
    } catch (error) {
      console.error('Category getWithServices error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
} 