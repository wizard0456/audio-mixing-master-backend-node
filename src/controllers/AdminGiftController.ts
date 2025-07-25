import { Request, Response } from 'express';
import { Gift } from '../models';
import sequelize from '../config/database';
import fs from 'fs';
import path from 'path';

export class AdminGiftController {
  /**
   * Display a listing of the resource.
   */
  static async index(req: Request, res: Response) {
    try {
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const page = parseInt(req.query['page'] as string) || 1;
      const offset = (page - 1) * perPage;

      const { count, rows } = await Gift.findAndCountAll({
        order: [['id', 'DESC']],
        limit: perPage,
        offset: offset,
      });

      if (rows.length === 0) {
        return res.status(404).json({ error: 'No data found' });
      }

      const totalPages = Math.ceil(count / perPage);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const data = {
        data: rows,
        current_page: page,
        per_page: perPage,
        total: count,
        total_pages: totalPages,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage,
      };

      return res.json(data);
    } catch (error) {
      console.error('Error in AdminGiftController.index:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Display the specified resource.
   */
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const gift = await Gift.findByPk(id);

      if (!gift) {
        return res.status(404).json({ error: 'No data found' });
      }

      return res.json(gift);
    } catch (error) {
      console.error('Error in AdminGiftController.show:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Store a newly created resource in storage.
   */
  static async store(req: Request, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      // Validation
      const { name, price, details } = req.body;

      if (!name || name.trim().length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Name required.' });
      }

      if (name.length > 255) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Name maximum 255 characters.' });
      }

      if (!price || isNaN(Number(price))) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Price required.' });
      }

      if (isNaN(Number(price))) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Price numeric.' });
      }

      // Create gift
      const giftData: any = {
        name: name.trim(),
        price: Number(price),
        details: details || null,
      };

      // Handle file upload
      if (req.file) {
        const imageName = `gift_image_${Date.now()}.${req.file.originalname.split('.').pop()}`;
        const uploadDir = path.join(process.cwd(), 'uploads', 'gift-images');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, imageName);
        fs.writeFileSync(filePath, req.file.buffer);

        giftData.image = `gift-images/${imageName}`;
      }

      const gift = await Gift.create(giftData, { transaction });

      await transaction.commit();
      return res.json(gift);
    } catch (error) {
      await transaction.rollback();
      console.error('Error in AdminGiftController.store:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update the specified resource in storage.
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, price, details } = req.body;

      // Validation
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name required.' });
      }

      if (name.length > 255) {
        return res.status(400).json({ error: 'Name maximum 255 characters.' });
      }

      if (!price || isNaN(Number(price))) {
        return res.status(400).json({ error: 'Price required.' });
      }

      if (isNaN(Number(price))) {
        return res.status(400).json({ error: 'Price numeric.' });
      }

      // Find gift
      const gift = await Gift.findByPk(id);

      if (!gift) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Handle file upload
      if (req.file) {
        // Delete old image if exists
        if (gift.image) {
          const oldImagePath = path.join(process.cwd(), 'uploads', gift.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        const imageName = `gift_image_${Date.now()}.${req.file.originalname.split('.').pop()}`;
        const uploadDir = path.join(process.cwd(), 'uploads', 'gift-images');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, imageName);
        fs.writeFileSync(filePath, req.file.buffer);

        gift.image = `gift-images/${imageName}`;
      }

      // Update gift
      gift.name = name.trim();
      gift.price = Number(price);
      gift.details = details || null;

      await gift.save();

      return res.json(gift);
    } catch (error) {
      console.error('Error in AdminGiftController.update:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update the specified resource status in storage.
   */
  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const statusParam  = req.query['status'];

      // Validation

      if (statusParam === undefined || statusParam === null) {
        return res.status(400).json({ error: 'Status required.' });
      }

      const status = statusParam === '1' ? true : false;

      if (typeof status !== 'boolean') {
        return res.status(400).json({ error: 'Status must be a boolean value.' });
      }

      // Find gift
      const gift = await Gift.findByPk(id);

      if (!gift) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Update status
      gift.is_active = status;
      await gift.save();

      return res.json(gift);
    } catch (error) {
      console.error('Error in AdminGiftController.updateStatus:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Remove the specified resource from storage.
   */
  static async destroy(req: Request, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      const gift = await Gift.findByPk(id);

      if (!gift) {
        await transaction.rollback();
        return res.status(404).json({ error: 'No data found' });
      }

      // Delete image file if exists
      if (gift.image) {
        const imagePath = path.join(process.cwd(), 'uploads', gift.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await gift.destroy({ transaction });

      await transaction.commit();
      return res.json('Deleted');
    } catch (error) {
      await transaction.rollback();
      console.error('Error in AdminGiftController.destroy:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 