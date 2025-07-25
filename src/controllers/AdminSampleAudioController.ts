import { Request, Response } from 'express';
import { Sample } from '../models';
import fs from 'fs';
import path from 'path';

export class AdminSampleAudioController {
  /**
   * Display a listing of the resource.
   */
  static async index(req: Request, res: Response) {
    try {
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const page = parseInt(req.query['page'] as string) || 1;
      const isActive = req.query['is_active'] as string;
      const offset = (page - 1) * perPage;

      // Initialize the query
      let whereClause: any = {};
      
      // Check if 'is_active' parameter is present and modify the query accordingly
      if (isActive === 'active') {
        whereClause.is_active = 1; // Filter for active samples
      } else if (isActive === 'inactive') {
        whereClause.is_active = 0; // Filter for inactive samples
      }

      const { count, rows } = await Sample.findAndCountAll({
        where: whereClause,
        order: [['id', 'DESC']],
        limit: perPage,
        offset: offset,
      });

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
      console.error('Error in AdminSampleAudioController.index:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Display the specified resource.
   */
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sample = await Sample.findByPk(id);

      if (!sample) {
        return res.status(404).json({ error: 'No data found' });
      }

      return res.json(sample);
    } catch (error) {
      console.error('Error in AdminSampleAudioController.show:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Store a newly created resource in storage.
   */
  static async store(req: Request, res: Response) {
    try {
      // Validation
      const { name } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name required.' });
      }

      if (name.length > 255) {
        return res.status(400).json({ error: 'Name maximum 255 characters.' });
      }

      // Check if files exist in request
      if (!req.files || !(req.files as any)['before_audio']) {
        return res.status(400).json({ error: 'Before audio required.' });
      }

      if (!req.files || !(req.files as any)['after_audio']) {
        return res.status(400).json({ error: 'After audio required.' });
      }

      const beforeAudioFile = (req.files as any)['before_audio'];
      const afterAudioFile = (req.files as any)['after_audio'];

      // Validate file types
      const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/aac'];
      if (!allowedMimeTypes.includes(beforeAudioFile[0].mimetype)) {
        return res.status(400).json({ error: 'Before audio must be a audio file.' });
      }

      if (!allowedMimeTypes.includes(afterAudioFile[0].mimetype)) {
        return res.status(400).json({ error: 'After audio must be a audio file.' });
      }

      // Create directory if it doesn't exist (equivalent to public_path in Laravel)
      const uploadDir = path.join(process.cwd(), 'public', 'sample-audios');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Handle before audio file
      const beforeAudioExtension = beforeAudioFile[0].originalname?.split('.').pop() || 'mp3';
      const beforeAudioName = `before_audio_${Date.now()}.${beforeAudioExtension}`;
      const beforeAudioPath = path.join(uploadDir, beforeAudioName);
      fs.writeFileSync(beforeAudioPath, beforeAudioFile[0].buffer);

      // Handle after audio file
      const afterAudioExtension = afterAudioFile[0].originalname?.split('.').pop() || 'mp3';
      const afterAudioName = `after_audio_${Date.now()}.${afterAudioExtension}`;
      const afterAudioPath = path.join(uploadDir, afterAudioName);
      fs.writeFileSync(afterAudioPath, afterAudioFile[0].buffer);

      const sample = await Sample.create({
        name: name.trim(),
        before_audio: `sample-audios/${beforeAudioName}`,
        after_audio: `sample-audios/${afterAudioName}`,
      });

      return res.json(sample);
    } catch (error) {
      console.error('Error in AdminSampleAudioController.store:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update the specified resource in storage.
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, is_active } = req.body;

      // Validation
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name required.' });
      }

      if (name.length > 255) {
        return res.status(400).json({ error: 'Name maximum 255 characters.' });
      }

      const sample = await Sample.findByPk(id);

      if (!sample) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Handle file uploads if provided
      if (req.files && (req.files as any)['before_audio']) {
        const beforeAudioFile = (req.files as any)['before_audio'];
        
        // Validate file type
        const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/aac'];
        if (!allowedMimeTypes.includes(beforeAudioFile[0].mimetype)) {
          return res.status(400).json({ error: 'Before audio must be a audio file.' });
        }

        // Delete old file if exists
        if (sample.before_audio) {
          const oldFilePath = path.join(process.cwd(), 'public', sample.before_audio);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }

        // Create directory if it doesn't exist (equivalent to public_path in Laravel)
        const uploadDir = path.join(process.cwd(), 'public', 'sample-audios');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Save new file
        const beforeAudioExtension = beforeAudioFile[0].originalname?.split('.').pop() || 'mp3';
        const beforeAudioName = `before_audio_${Date.now()}.${beforeAudioExtension}`;
        const beforeAudioPath = path.join(uploadDir, beforeAudioName);
        fs.writeFileSync(beforeAudioPath, beforeAudioFile[0].buffer);

        sample.before_audio = `sample-audios/${beforeAudioName}`;
      }

      if (req.files && (req.files as any)['after_audio']) {
        const afterAudioFile = (req.files as any)['after_audio'];
        
        // Validate file type
        const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/aac'];
        if (!allowedMimeTypes.includes(afterAudioFile[0].mimetype)) {
          return res.status(400).json({ error: 'After audio must be a audio file.' });
        }

        // Delete old file if exists
        if (sample.after_audio) {
          const oldFilePath = path.join(process.cwd(), 'public', sample.after_audio);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }

        // Create directory if it doesn't exist (equivalent to public_path in Laravel)
        const uploadDir = path.join(process.cwd(), 'public', 'sample-audios');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Save new file
        const afterAudioExtension = afterAudioFile[0].originalname?.split('.').pop() || 'mp3';
        const afterAudioName = `after_audio_${Date.now()}.${afterAudioExtension}`;
        const afterAudioPath = path.join(uploadDir, afterAudioName);
        fs.writeFileSync(afterAudioPath, afterAudioFile[0].buffer);

        sample.after_audio = `sample-audios/${afterAudioName}`;
      }

      // Update sample
      sample.name = name.trim();
      if (is_active !== undefined) {
        sample.is_active = is_active;
      }
      await sample.save();

      return res.json(sample);
    } catch (error) {
      console.error('Error in AdminSampleAudioController.update:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update the specified resource status in storage.
   */
  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const statusParam = req.query['status'];

      // Validation
      if (statusParam === undefined || statusParam === null) {
        return res.status(400).json({ error: 'Status required.' });
      }

      const status = statusParam === '1' ? true : false;

      if (typeof status !== 'boolean') {
        return res.status(400).json({ error: 'Status must be a boolean value.' });
      }

      const sample = await Sample.findByPk(id);

      if (!sample) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Update status
      sample.is_active = status ? 1 : 0;
      await sample.save();

      return res.json(sample);
    } catch (error) {
      console.error('Error in AdminSampleAudioController.updateStatus:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Remove the specified resource from storage.
   */
  static async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sample = await Sample.findByPk(id);

      if (!sample) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Delete audio files if they exist
      if (sample.before_audio) {
        const beforeAudioPath = path.join(process.cwd(), 'public', sample.before_audio);
        if (fs.existsSync(beforeAudioPath)) {
          fs.unlinkSync(beforeAudioPath);
        }
      }

      if (sample.after_audio) {
        const afterAudioPath = path.join(process.cwd(), 'public', sample.after_audio);
        if (fs.existsSync(afterAudioPath)) {
          fs.unlinkSync(afterAudioPath);
        }
      }

      await sample.destroy();

      return res.json('Deleted');
    } catch (error) {
      console.error('Error in AdminSampleAudioController.destroy:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 