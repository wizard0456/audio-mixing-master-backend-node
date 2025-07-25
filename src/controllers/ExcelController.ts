import { Request, Response } from 'express';
import { Order, User, OrderItem, Service } from '../models';

export class ExcelController {
  /**
   * Export orders to PDF/Excel.
   */
  static async exportOrders(_req: Request, res: Response) {
    try {
      const orders = await Order.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email'],
          },
          {
            model: OrderItem,
            as: 'orderItems',
            include: [
              {
                model: Service,
                as: 'service',
                attributes: ['id', 'name', 'price'],
              },
            ],
          },
        ],
        order: [['id', 'DESC']],
      });

      // Convert to CSV format for now
      const csvData = orders.map(order => {
        const data = order.toJSON();
        return Object.values(data).join(',');
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
      return res.send(csvData);
    } catch (error) {
      console.error('ExcelController exportOrders error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
} 