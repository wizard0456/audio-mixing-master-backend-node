import { Response } from 'express';
import { Order, OrderItem, Service, Revision } from '../models';
import { AuthRequest } from '../middleware/auth';

export class OrderController {
  // Get all orders for a user
  static async index(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const page = parseInt(req.query['page'] as string) || 1;
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const offset = (page - 1) * perPage;

      // Build where conditions
      const whereConditions: any = { user_id: userId };

      const { count, rows: orders } = await Order.findAndCountAll({
        where: whereConditions,
        include: [
          { model: OrderItem, as: 'orderItems', include: [{ model: Service, as: 'service' }] },
        ],
        order: [['created_at', 'DESC']],
        limit: perPage,
        offset: offset,
      });

      const totalPages = Math.ceil(count / perPage);

      return res.json({
        success: true,
        data: {
          orders,
          pagination: {
            current_page: page,
            per_page: perPage,
            total: count,
            total_pages: totalPages,
            has_next_page: page < totalPages,
            has_prev_page: page > 1,
          },
        },
      });
    } catch (error) {
      console.error('Order index error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get order by ID
  static async show(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const order = await Order.findOne({
        where: { id, user_id: userId },
        include: [
          { model: OrderItem, as: 'orderItems', include: [{ model: Service, as: 'service' }] },
        ],
      });
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Get revisions for this order
      const revisions = await Revision.findAll({
        where: { order_id: id },
        order: [['created_at', 'DESC']]
      });

      return res.json({ 
        success: true, 
        data: { 
          order: {
            ...order.toJSON(),
            revisions: revisions
          }
        } 
      });
    } catch (error) {
      console.error('Order show error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Create order
  static async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { amount, currency, order_type } = req.body;
      const order = await Order.create({
        user_id: userId,
        transaction_id: `TXN_${Date.now()}`,
        amount,
        currency: currency || 'USD',
        order_type,
        Order_status: 0,
      });
      return res.status(201).json({ success: true, data: { order } });
    } catch (error) {
      console.error('Order create error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Update order status
  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { Order_status } = req.body;
      const userId = req.user?.id;
      const order = await Order.findOne({ where: { id, user_id: userId } });
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      order.Order_status = Order_status;
      await order.save();
      return res.json({ success: true, data: { order } });
    } catch (error) {
      console.error('Order updateStatus error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get order statistics
  static async getStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const totalOrders = await Order.count({ where: { user_id: userId } });
      const totalSpent = await Order.sum('amount', { where: { user_id: userId } });
      const averageOrderValue = totalSpent ? totalSpent / totalOrders : 0;

      const stats = {
        totalOrders,
        totalSpent,
        averageOrderValue,
      };

      return res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      console.error('Order stats error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
} 