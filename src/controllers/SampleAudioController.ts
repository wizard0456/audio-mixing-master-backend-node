import { Request, Response } from 'express';
import { Sample } from '../models';

export class SampleAudioController {
  /**
   * Display a listing of the resource.
   */
  static async index(req: Request, res: Response) {
    try {
      const perPage = parseInt(req.query['per_page'] as string) || 12;
      const page = parseInt(req.query['page'] as string) || 1;
      const offset = (page - 1) * perPage;

      const { count, rows: samples } = await Sample.findAndCountAll({
        where: { is_active: 1 },
        offset,
        limit: perPage,
        order: [['createdAt', 'DESC']],
      });

      if (count === 0) {
        return res.status(404).json({ error: 'No data found.' });
      }

      const lastPage = Math.ceil(count / perPage);

      // Format samples to match the expected JSON structure
      const formattedSamples = samples.map((sample: any) => {
        const sampleData = sample.toJSON();
        return {
          id: sampleData.id,
          name: sampleData.name,
          before_audio: sampleData.before_audio,
          after_audio: sampleData.after_audio,
          is_active: sampleData.is_active,
          created_at: sampleData.createdAt,
          updated_at: sampleData.updatedAt,
        };
      });

      // Generate base URL (without query params)
      const protocol = req.protocol;
      const host = req.get('host');
      const basePath = req.baseUrl + req.path;
      const baseUrl = `${protocol}://${host}${basePath}`;

      // Pagination URLs
      const firstPageUrl = `${baseUrl}?page=1`;
      const lastPageUrl = `${baseUrl}?page=${lastPage}`;
      const nextPageUrl = page < lastPage ? `${baseUrl}?page=${page + 1}` : null;
      const prevPageUrl = page > 1 ? `${baseUrl}?page=${page - 1}` : null;

      // Pagination links array
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
          url: `${baseUrl}?page=${i}`,
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
        data: formattedSamples,
        first_page_url: firstPageUrl,
        from: count === 0 ? null : ((page - 1) * perPage) + 1,
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
      console.error('Sample audio index error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Display the specified resource.
   */
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const sample = await Sample.findOne({
        where: { id, is_active: 1 },
      });

      if (!sample) {
        return res.status(404).json({ error: 'No data found.' });
      }

      // Format sample to match the expected JSON structure
      const sampleData = sample.toJSON();
      const formattedSample = {
        id: sampleData.id,
        name: sampleData.name,
        before_audio: sampleData.before_audio,
        after_audio: sampleData.after_audio,
        is_active: sampleData.is_active,
        created_at: sampleData.createdAt,
        updated_at: sampleData.updatedAt,
      };

      return res.json(formattedSample);
    } catch (error) {
      console.error('Sample audio show error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
} 