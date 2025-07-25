import { Request, Response } from 'express';
import { UploadLeadGeneration } from '../models';

export class LeadGenerationController {
  /**
   * Display a listing of the resource.
   */
  static async index(req: Request, res: Response) {
    try {
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const page = parseInt(req.query['page'] as string) || 1;
      const offset = (page - 1) * perPage;

      const { count, rows: leads } = await UploadLeadGeneration.findAndCountAll({
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
        data: leads,
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
      console.error('LeadGeneration index error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Display the specified resource.
   */
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const lead = await UploadLeadGeneration.findByPk(id);

      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      return res.json(lead);
    } catch (error) {
      console.error('LeadGeneration show error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Store a newly created resource in storage.
   */
  static async store(req: Request, res: Response) {
    try {
      const lead = await UploadLeadGeneration.create(req.body);
      return res.status(201).json(lead);
    } catch (error) {
      console.error('LeadGeneration store error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Remove the specified resource from storage.
   */
  static async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const lead = await UploadLeadGeneration.findByPk(id);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      await lead.destroy();
      return res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
      console.error('LeadGeneration destroy error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Export lead data.
   */
  static async exportLead(_req: Request, res: Response) {
    try {
      const leads = await UploadLeadGeneration.findAll({
        order: [['id', 'DESC']],
      });

      // Convert to CSV format
      const csvData = leads.map(lead => {
        const data = lead.toJSON();
        return Object.values(data).join(',');
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
      return res.send(csvData);
    } catch (error) {
      console.error('LeadGeneration export error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
} 