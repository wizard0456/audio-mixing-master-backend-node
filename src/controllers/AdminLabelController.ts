import { Request, Response } from 'express';
import { Label } from '../models';
import sequelize from '../config/database';

export class AdminLabelController {
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
        whereClause.is_active = 1; // Filter for active labels
      } else if (isActive === 'inactive') {
        whereClause.is_active = 0; // Filter for inactive labels
      }

      const { count, rows } = await Label.findAndCountAll({
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
      console.error('Error in AdminLabelController.index:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Display the specified resource.
   */
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const label = await Label.findByPk(id);

      if (!label) {
        return res.status(404).json({ error: 'No data found' });
      }

      return res.json(label);
    } catch (error) {
      console.error('Error in AdminLabelController.show:', error);
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
      const { name } = req.body;

      if (!name || name.trim().length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Name required.' });
      }

      if (name.length > 255) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Name maximum 255 characters.' });
      }

      const label = await Label.create({
        name: name.trim(),
      }, { transaction });

      await transaction.commit();
      return res.json(label);
    } catch (error) {
      await transaction.rollback();
      console.error('Error in AdminLabelController.store:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update the specified resource in storage.
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, is_active } = req.query;
        
      // Convert query parameter to string
      const nameStr = name as string;
      
      // Validate name
      if (!nameStr || nameStr.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required.' });
      }
    
      if (nameStr.length > 255) {
        return res.status(400).json({ error: 'Name must be 255 characters or fewer.' });
      }
    
      // Fetch label
      const label = await Label.findByPk(id);
    
      if (!label) {
        return res.status(404).json({ error: 'Label not found.' });
      }
    
      // Update fields
      label.name = nameStr.trim();
    
      if (typeof is_active !== 'undefined') {
        label.is_active = (is_active === '1' || is_active === 'true') ? 1 : 0;
      }
    
      await label.save();
    
      return res.json(label);
    } catch (error) {
      console.error('Error in AdminLabelController.update:', error);
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

      const label = await Label.findByPk(id);

      if (!label) {
        await transaction.rollback();
        return res.status(404).json({ error: 'No data found' });
      }

      await label.destroy({ transaction });

      await transaction.commit();
      return res.json('Deleted');
    } catch (error) {
      await transaction.rollback();
      console.error('Error in AdminLabelController.destroy:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 