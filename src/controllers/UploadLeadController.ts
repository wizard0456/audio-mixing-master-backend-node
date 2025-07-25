import { Request, Response } from 'express';
import { UploadLeadGeneration } from '../models';
import { validationResult } from 'express-validator';

export class UploadLeadController {
  /**
   * Display a listing of the resource.
   */
  public static async index(req: Request, res: Response) {
    try {
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const page = parseInt(req.query['page'] as string) || 1;
      const offset = (page - 1) * perPage;

      const { count, rows: uploadLeads } = await UploadLeadGeneration.findAndCountAll({
        order: [['id', 'DESC']],
        offset,
        limit: perPage,
      });

      if (count === 0) {
        return res.status(404).json({ error: 'No data found' });
      }

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
        data: uploadLeads,
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
      console.error('Upload lead index error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Display the specified resource.
   */
  public static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const uploadLead = await UploadLeadGeneration.findByPk(id);

      if (!uploadLead) {
        return res.status(404).json({ error: 'No data found' });
      }

      return res.json(uploadLead);
    } catch (error) {
      console.error('Upload lead show error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Store a newly created resource in storage.
   */
  public static async store(req: Request, res: Response) {
    try {
      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0]?.msg || 'Validation error' });
      }

      const { name, email, arlist_name, tarck_title, image_url, services, reference } = req.body;

      if (!image_url) {

        return res.status(400).json({ error: 'An image URL is required.' });
      }

      // Validate URL format
      try {
        new URL(image_url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format.' });
      }

      const uploadLead = await UploadLeadGeneration.create({
        name,
        email,
        arlist_name,
        tarck_title,
        image: image_url,
        services,
        reference,
        file_type: 0, // Always 0 for URL uploads
      });

      return res.json({ message: 'success', upload_leads: uploadLead });
    } catch (error) {
      console.error('Upload lead store error:', error);
      return res.status(400).json({ error: 'Server error' });
    }
  }

  /**
   * Remove the specified resource from storage.
   */
  public static async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const uploadLead = await UploadLeadGeneration.findByPk(id);

      if (!uploadLead) {
        return res.status(404).json({ error: 'No data found' });
      }

      // No file deletion needed for URL uploads

      await uploadLead.destroy();

      return res.json('Deleted');
    } catch (error) {
      console.error('Upload lead destroy error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Display test method.
   */
  public static async display(_req: Request, res: Response) {
    return res.json('helo');
  }

  /**
   * Get file URL.
   */
  public static async downloadZip(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const uploadLead = await UploadLeadGeneration.findByPk(id);
      if (!uploadLead) {
        return res.status(404).json({ error: 'No data found' });
      }

      const imageUrl = uploadLead.image;
      if (!imageUrl) {
        return res.status(404).json({ error: 'No File found' });
      }

      return res.json({ url: imageUrl });
    } catch (error) {
      console.error('Get file URL error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Get file URL.
   */
  public static async downloadAudio(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const uploadLead = await UploadLeadGeneration.findByPk(id);
      if (!uploadLead) {
        return res.status(404).json({ error: 'No order found' });
      }

      const imageUrl = uploadLead.image;
      if (!imageUrl) {
        return res.status(404).json({ error: 'No file found' });
      }

      return res.json({ url: imageUrl });
    } catch (error) {
      console.error('Get file URL error:', error);
      return res.status(400).json({ error: 'Server error' });
    }
  }
} 