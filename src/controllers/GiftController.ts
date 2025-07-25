import { Request, Response } from 'express';
import { Gift } from '../models';

export class GiftController {
  /**
   * Display a listing of the resource.
   */
  static async index(req: Request, res: Response) {
    try {
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const page = parseInt(req.query['page'] as string) || 1;
      const offset = (page - 1) * perPage;

      const { count, rows: gifts } = await Gift.findAndCountAll({
        where: { is_active: 1 },
        order: [['id', 'DESC']],
        offset,
        limit: perPage,
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

      return res.json({
        current_page: page,
        data: gifts,
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
      console.error('Gift index error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Display the specified resource.
   */
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const gift = await Gift.findOne({
        where: { id, is_active: 1 },
      });

      if (!gift) {
        return res.status(404).json({ message: 'Gift not found' });
      }

      return res.json(gift);
    } catch (error) {
      console.error('Gift show error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
} 