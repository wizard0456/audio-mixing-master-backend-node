import { Request, Response } from 'express';
import { FAQ } from '../models';

export class FaqController {
  public static async FaqList(_req: Request, res: Response) {
    try {
      const faqs = await FAQ.findAll({
        order: [['created_at', 'ASC']],
      });

      if (faqs.length === 0) {
        return res.status(200).json({ error: 'No data found' });
      }

      return res.json(faqs);
    } catch (error) {
      console.error('FAQ list error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
} 