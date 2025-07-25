import { Request, Response } from 'express';
import { Tag } from '../models';
import sequelize from '../config/database';

export class AdminTagController {
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
        whereClause.is_active = 1; // Filter for active tags
      } else if (isActive === 'inactive') {
        whereClause.is_active = 0; // Filter for inactive tags
      }

      const { count, rows } = await Tag.findAndCountAll({
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
      console.error('Error in AdminTagController.index:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Display the specified resource.
   */
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const tag = await Tag.findByPk(id);

      if (!tag) {
        return res.status(404).json({ error: 'No data found' });
      }

      return res.json(tag);
    } catch (error) {
      console.error('Error in AdminTagController.show:', error);
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
      const { tag_name } = req.body;

      if (!tag_name || tag_name.trim().length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Tag Name required.' });
      }

      if (tag_name.length > 255) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Tag Name maximum 255 characters.' });
      }

      const tag = await Tag.create({
        tag_name: tag_name.trim(),
      }, { transaction });

      await transaction.commit();
      return res.json(tag);
    } catch (error) {
      await transaction.rollback();
      console.error('Error in AdminTagController.store:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update the specified resource in storage.
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tag_name, is_active } = req.query;

      // Convert query parameters to proper types
      const tagNameStr = tag_name as string;
      const isActive = is_active === '1' || is_active === 'true';

      // Validation
      if (!tagNameStr || tagNameStr.trim().length === 0) {
        return res.status(400).json({ error: 'Tag Name required.' });
      }

      if (tagNameStr.length > 255) {
        return res.status(400).json({ error: 'Tag Name maximum 255 characters.' });
      }

      const tag = await Tag.findByPk(id);

      if (!tag) {
        return res.status(404).json({ error: 'No data found' });
      }

      tag.tag_name = tagNameStr.trim();
      if (is_active !== undefined) {
        tag.is_active = isActive;
      }
      await tag.save();

      return res.json(tag);
    } catch (error) {
      console.error('Error in AdminTagController.update:', error);
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

      const tag = await Tag.findByPk(id);

      if (!tag) {
        await transaction.rollback();
        return res.status(404).json({ error: 'No data found' });
      }

      await tag.destroy({ transaction });

      await transaction.commit();
      return res.json('Deleted');
    } catch (error) {
      await transaction.rollback();
      console.error('Error in AdminTagController.destroy:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 