import { Request, Response } from 'express';
import { Gallery } from '../models';

export class GalleryController {
  /**
   * Display a listing of the resource.
   */
  static async index(_req: Request, res: Response) {
    try {
      const galleries = await Gallery.findAll({
        where: { is_active: 1 },
        order: [['created_at', 'DESC']],
      });

      if (galleries.length === 0) {
        return res.status(404).json({ error: 'No data found.' });
      }

      // Format galleries to match the expected JSON structure
      const formattedGalleries = galleries.map((gallery: any) => {
        const galleryData = gallery.toJSON();
        return {
          id: galleryData.id,
          image: galleryData.image,
          is_active: galleryData.is_active,
          created_at: galleryData.createdAt,
          updated_at: galleryData.updatedAt,
        };
      });

      return res.json(formattedGalleries);
    } catch (error) {
      console.error('Gallery index error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Display the specified resource.
   */
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const gallery = await Gallery.findOne({
        where: { id, is_active: 1 },
      });

      if (!gallery) {
        return res.status(404).json({ error: 'No data found.' });
      }

      // Format gallery to match the expected JSON structure
      const galleryData = gallery.toJSON();
      const formattedGallery = {
        id: galleryData.id,
        image: galleryData.image,
        is_active: galleryData.is_active,
        created_at: galleryData.createdAt,
        updated_at: galleryData.updatedAt,
      };

      return res.json(formattedGallery);
    } catch (error) {
      console.error('Gallery show error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
} 