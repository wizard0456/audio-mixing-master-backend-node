import { Request, Response } from 'express';
import Gallery from '../models/Gallery';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

export class AdminGalleryController {
  // Get all gallery items
  static async index(_req: Request, res: Response) {
    try {
      const galleries = await Gallery.findAll({
        order: [['id', 'DESC']],
      });

      if (galleries.length === 0) {
        return res.status(404).json({ error: 'No data found' });
      }

      return res.json(galleries);
    } catch (error) {
      console.error('Get galleries error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Create new gallery item
  static async store(req: AuthRequest, res: Response) {
    try {
      // Check if file exists in request
      if (!req.file) {
        return res.status(400).json({ error: 'Image required.' });
      }

      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Image must be a valid image file.' });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `image_${timestamp}${fileExtension}`;
      
      // Create directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'gallary-images');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Move file to destination
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);

      // Save to database
      const gallery = await Gallery.create({
        image: `gallary-images/${fileName}`,
        is_active: 1,
      });

      return res.json(gallery);
    } catch (error) {
      console.error('Create gallery error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Get gallery item by ID
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const gallery = await Gallery.findByPk(id);

      if (!gallery) {
        return res.status(404).json({ error: 'No data found' });
      }

      return res.json(gallery);
    } catch (error) {
      console.error('Get gallery error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Update gallery item status
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      // Validation
      if (status === undefined || status === null) {
        return res.status(400).json({ error: 'Status required.' });
      }

      if (typeof status !== 'boolean') {
        return res.status(400).json({ error: 'Invalid status.' });
      }

      const gallery = await Gallery.findByPk(id);

      if (!gallery) {
        return res.status(404).json({ error: 'No data found' });
      }

      await gallery.update({
        is_active: status ? 1 : 0,
      });

      return res.json(gallery);
    } catch (error) {
      console.error('Update gallery error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Delete gallery item
  static async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const gallery = await Gallery.findByPk(id);

      if (!gallery) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Delete file from filesystem if it exists
      if (gallery.image) {
        const filePath = path.join(process.cwd(), 'public', gallery.image);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await gallery.destroy();

      return res.json('Deleted');
    } catch (error) {
      console.error('Delete gallery error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
} 